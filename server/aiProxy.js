// Handler proxy backend untuk AI Chatbot Getara
// Menyimpan pemanggilan Gemini & Mistral di server sehingga API key tidak terekspos di browser client.

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk platform Getara — sistem Machine Health Monitoring berbasis sensor getaran/vibrasi.

Tugasmu membantu pengguna memahami:
- Data monitoring mesin (vibrasi, getaran, frekuensi, amplitudo)
- Status kesehatan mesin dan artinya (Normal, Waspada, Anomali)
- Alert/peringatan yang muncul di dashboard
- Analisis tren dan anomali data sensor
- Rekomendasi perawatan preventif (predictive maintenance)
- Cara membaca dan menginterpretasi grafik getaran
- Istilah teknis seputar kondisi monitoring mesin

Gunakan bahasa Indonesia yang mudah dipahami, namun profesional.
Jawaban harus ringkas, informatif, dan relevan dengan konteks monitoring mesin.
Jika ditanya di luar topik tersebut, arahkan kembali ke topik Getara.`;

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

async function callGemini(messages, apiKey) {
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
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
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

async function callMistral(messages, apiKey) {
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
        { role: 'system', content: SYSTEM_PROMPT },
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

export async function processAIChat(messages, env = {}) {
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

  const callers = [];
  if (geminiKey) callers.push(withRetry(callGemini, [messages, geminiKey]));
  if (mistralKey) callers.push(withRetry(callMistral, [messages, mistralKey]));

  try {
    return await Promise.any(callers);
  } catch (aggErr) {
    const firstErr = (aggErr?.errors && aggErr.errors[0]) || aggErr;
    throw firstErr;
  }
}
