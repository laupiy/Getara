// Handler proxy backend untuk AI Chatbot Getara
// Menyimpan pemanggilan Gemini & Mistral di server sehingga API key tidak terekspos di browser client.

function buildSystemPrompt(machineContext) {
  let contextSection = '';
  if (machineContext) {
    contextSection = `
DATA MONITORING MESIN REAL-TIME SAAT INI (GETARA TELEMETRY):
- Status Kesehatan Mesin: ${machineContext.status || 'Normal'}
- Nilai Getaran RMS: ${machineContext.rms ? `${machineContext.rms} g` : 'Tidak tersedia'} (Rasio terhadap baseline: ${machineContext.ratio ? `${machineContext.ratio}x` : '1x'})
- Baseline RMS Normal: ${machineContext.baselineRms ? `${machineContext.baselineRms} g` : 'Tidak tersedia'}
- Skor Anomali (Heuristik): ${machineContext.score !== undefined ? machineContext.score : 'Tidak tersedia'} (Ambang Waspada: 0.35, Anomali: 0.60)
- Kondisi / Skenario Mesin: ${machineContext.scenario || 'Normal'}
- Kecepatan Motor: ${machineContext.speed || 'Sedang'}
- Suhu Motor: ${machineContext.temperature !== undefined ? `${machineContext.temperature} °C` : 'Sensor Nonaktif'}
- Status Monitoring: ${machineContext.running ? 'Sedang Berjalan (Streaming Data)' : 'Dijeda (Paused)'}
- Peringatan (Alerts): ${machineContext.unreadAlerts || 0} alert belum dibaca dari total ${machineContext.totalAlerts || 0} alert.
${machineContext.recentAlert ? `- Alert Terbaru: ${machineContext.recentAlert}` : ''}

(Catatan: Gunakan data real-time di atas jika pengguna menanyakan kondisi mesin saat ini, nilai getaran, suhu, alert yang sedang aktif, atau kesehatan motor!)
`;
  }

  return `Kamu adalah asisten AI resmi untuk platform Getara — sistem Machine Health Monitoring berbasis sensor getaran/vibrasi (ADXL345, ESP32, Motor DC 12V).
${contextSection}
ATURAN & BATASAN KETAT (GUARDRAILS):
1. FOKUS TOPIK: Kamu HANYA boleh menjawab pertanyaan seputar platform Getara, monitoring getaran mesin (RMS, crest factor, FFT), sensor (ADXL345, DS18B20, ESP32), status kesehatan mesin (Normal, Waspada, Anomali), deteksi anomali, sistem peringatan (alerts), dan predictive maintenance mesin.
2. BATASAN DI LUAR TOPIK:
   - Jika ditanya hal pribadi (seperti "kamu umur berapa", "siapa pacarmu", "kamu tinggal di mana", "jenis kelaminmu apa", dll.),
   - Jika ditanya topik umum di luar Getara (politik, selebriti, resep makanan, film, matematika umum, ramalan, coding umum non-Getara, dll.):
   TOLAK DENGAN RAMAH DAN SOPAN dalam 1-2 kalimat, dan kembalikan fokus ke pemantauan mesin Getara.
   Contoh respon: "Maaf, saya adalah asisten khusus Getara. Saya hanya dapat membantu menjawab seputar monitoring kesehatan mesin, data getaran, dan peringatan sistem."
   JANGAN PERNAH mengarang jawaban pribadi seperti menyebut umur manusia atau meladeni obrolan di luar monitoring mesin.
3. IDENTITAS DIRI: Kamu adalah "Asisten AI Getara" dengan maskot Yeti cerdas, yang bertugas membantu teknisi dan operator memahami data getaran dan kondisi mesin.
4. GAYA PENYAMPAIAN: Gunakan bahasa Indonesia yang profesional, ringkas, jelas, dan ramah. Gunakan format markdown (tebal, butir poin) agar data mudah dibaca oleh pengguna.`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, args, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(...args);
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(500);
    }
  }
}

async function callGemini(messages, apiKey, systemPrompt) {
  if (!apiKey) {
    const err = new Error('Kunci GEMINI_API_KEY tidak ditemukan.');
    err.code = 'API_KEY_MISSING';
    err.provider = 'gemini';
    throw err;
  }

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (res.status === 404) continue;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `Gemini HTTP ${res.status}`;
        if (msg.includes('no longer available')) continue;
        const e = new Error(msg);
        e.status = res.status;
        e.provider = 'gemini';
        if (res.status === 429) e.code = 'RATE_LIMIT';
        throw e;
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return { reply: reply || '(Tidak ada respons dari Gemini)', provider: 'gemini' };
    } catch (err) {
      if (!err.provider) err.provider = 'gemini';
      throw err;
    }
  }

  const e = new Error('Model Gemini tidak tersedia atau kuota habis.');
  e.provider = 'gemini';
  throw e;
}

async function callMistral(messages, apiKey, systemPrompt) {
  if (!apiKey) {
    const err = new Error('Kunci MISTRAL_API_KEY tidak ditemukan.');
    err.code = 'API_KEY_MISSING';
    err.provider = 'mistral';
    throw err;
  }

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const e = new Error(errJson?.message || `Mistral HTTP ${res.status}`);
    e.status = res.status;
    e.provider = 'mistral';
    if (res.status === 429) e.code = 'RATE_LIMIT';
    throw e;
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  return { reply: reply || '(Tidak ada respons dari Mistral)', provider: 'mistral' };
}

export async function processAIChat(messages, env = {}, machineContext = null) {
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  const mistralKey = env.MISTRAL_API_KEY || env.VITE_MISTRAL_API_KEY || '';

  if (!geminiKey && !mistralKey) {
    const err = new Error(
      'Kunci API belum dikonfigurasi. Tambahkan GEMINI_API_KEY atau MISTRAL_API_KEY di file .env proyek.'
    );
    err.status = 500;
    err.code = 'API_KEY_MISSING';
    throw err;
  }

  const systemPrompt = buildSystemPrompt(machineContext);

  const callers = [];
  if (geminiKey) callers.push(withRetry(callGemini, [messages, geminiKey, systemPrompt]));
  if (mistralKey) callers.push(withRetry(callMistral, [messages, mistralKey, systemPrompt]));

  try {
    return await Promise.any(callers);
  } catch (aggErr) {
    const firstErr = (aggErr?.errors && aggErr.errors[0]) || aggErr;
    throw firstErr;
  }
}
