import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, X, Loader2, Send } from 'lucide-react';

// Helper sleep for retries
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry wrapper
async function withRetry(fn, args, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(...args);
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(500);
    }
  }
}

// ============================================================
// API Keys dari .env
// ============================================================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || '';

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk platform Getara — sistem Machine Health Monitoring berbasis sensor getaran/vibrasi.

Tugasmu membantu pengguna memahami:
- Data monitoring mesin (vibrasi, getaran, frekuensi, amplitudo)
- Status kesehatan mesin dan artinya (Normal, Warning, Critical)
- Alert/peringatan yang muncul di dashboard
- Analisis tren dan anomali data sensor
- Rekomendasi perawatan preventif (predictive maintenance)
- Cara membaca dan menginterpretasi grafik getaran
- Istilah teknis seputar kondisi monitoring mesin

Gunakan bahasa Indonesia yang mudah dipahami, namun profesional.
Jawaban harus ringkas, informatif, dan relevan dengan konteks monitoring mesin.
Jika ditanya di luar topik tersebut, arahkan kembali ke topik Getara.`;

let lastProvider = 'gemini';

// ---- Gemini API ----
async function callGemini(messages) {
  if (!GEMINI_API_KEY) {
    const e = new Error('GEMINI_API_KEY tidak ditemukan');
    e.provider = 'gemini';
    throw e;
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
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `Gemini HTTP ${res.status}`;
        if (msg.includes('no longer available')) continue;
        const e = new Error(msg);
        e.provider = 'gemini';
        throw e;
      }

      const data = await res.json();
      lastProvider = 'gemini';
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '(Tidak ada respons)';
    } catch (err) {
      if (!err.provider) err.provider = 'gemini';
      throw err;
    }
  }

  const e = new Error('Model Gemini tidak tersedia');
  e.provider = 'gemini';
  throw e;
}

// ---- Mistral API ----
async function callMistral(messages) {
  if (!MISTRAL_API_KEY) {
    const e = new Error('MISTRAL_API_KEY tidak ditemukan');
    e.provider = 'mistral';
    throw e;
  }

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
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
    const err = await res.json().catch(() => ({}));
    const e = new Error(err?.message || `Mistral HTTP ${res.status}`);
    e.provider = 'mistral';
    throw e;
  }

  const data = await res.json();
  lastProvider = 'mistral';
  return data?.choices?.[0]?.message?.content || '(Tidak ada respons)';
}

// ---- Pakai provider yang balas duluan ----
async function sendToAI(messages) {
  try {
    return await Promise.any([
      withRetry(callGemini, [messages]),
      withRetry(callMistral, [messages]),
    ]);
  } catch (e) {
    const firstErr = (e && e.errors && e.errors[0]) || e;
    const providerInfo = firstErr?.provider ? `[${firstErr.provider}] ` : '';
    throw new Error(`${providerInfo}Semua AI sedang sibuk. Coba lagi sebentar.`);
  }
}

// ---- Robot Icon SVG ----
function RobotIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="robot-3d"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c8780a" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#e08010" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="eyeGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      <line x1="24" y1="2" x2="24" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="1.5" r="2.2" fill="white" opacity="0.95" />
      <rect x="10" y="9" width="28" height="20" rx="6" fill="url(#headGrad)" filter="url(#shadow)" />
      <rect x="13" y="10.5" width="22" height="5" rx="3" fill="white" opacity="0.25" />
      <circle cx="17.5" cy="20" r="4" fill="#0a1929" />
      <circle cx="17.5" cy="20" r="2.8" fill="url(#eyeGrad)" />
      <circle cx="16.5" cy="18.8" r="1" fill="white" opacity="0.8" />
      <circle cx="30.5" cy="20" r="4" fill="#0a1929" />
      <circle cx="30.5" cy="20" r="2.8" fill="url(#eyeGrad)" />
      <circle cx="29.5" cy="18.8" r="1" fill="white" opacity="0.8" />
      <rect x="15" y="26" width="18" height="3" rx="1.5" fill="white" opacity="0.3" />
      <rect x="15" y="26" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
      <rect x="20" y="29" width="8" height="4" rx="2" fill="white" opacity="0.5" />
      <rect x="9" y="33" width="30" height="13" rx="5" fill="url(#bodyGrad)" filter="url(#shadow)" />
      <rect x="12" y="34.5" width="24" height="4" rx="2" fill="white" opacity="0.2" />
      <circle cx="18" cy="41" r="2" fill="#22c55e" opacity="0.9" />
      <circle cx="24" cy="41" r="2" fill="#38bdf8" opacity="0.9" />
      <circle cx="30" cy="41" r="2" fill="#f59e0b" opacity="0.9" />
      <rect x="2" y="34" width="6" height="10" rx="3" fill="url(#bodyGrad)" filter="url(#shadow)" />
      <rect x="40" y="34" width="6" height="10" rx="3" fill="url(#bodyGrad)" filter="url(#shadow)" />
    </svg>
  );
}

// ---- Message Bubble ----
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas-deep shadow-sm shadow-accent/20 ring-1 ring-accent/20 animate-wiggle">
          <RobotIcon size={30} />
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-accent text-on-accent'
            : 'rounded-tl-sm bg-surface-raised text-slate-200'
        }`}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ---- Typing Indicator ----
function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-canvas-deep shadow-sm shadow-accent/20 ring-1 ring-accent/20">
        <RobotIcon size={22} />
      </span>
      <div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-surface-raised px-3 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  'Apa itu RMS Vibration?',
  'Bagaimana cara baca grafik getaran?',
  'Status Warning artinya apa?',
  'Tips predictive maintenance?',
];

// ---- Main Chatbot Component ----
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Halo! Saya asisten AI Getara 👋\nSaya siap membantu kamu memahami data monitoring mesin, alert, dan analisis getaran. Ada yang bisa saya bantu?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [lastFailedMessages, setLastFailedMessages] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const doSend = async (newMessages) => {
    setLoading(true);
    setError('');
    setLastFailedMessages(null);
    try {
      const reply = await sendToAI(newMessages);
      setProvider(lastProvider);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message);
      setLastFailedMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    await doSend(newMessages);
  };

  const handleRetry = () => {
    if (lastFailedMessages) doSend(lastFailedMessages);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat direset. Saya siap membantu lagi! 🔄' }]);
    setError('');
    setLastFailedMessages(null);
  };

  return (
    <>
      {/* Tombol buka chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-accent opacity-30 animate-sonar" />
            <span className="absolute inset-0 rounded-full bg-accent opacity-20 animate-sonar [animation-delay:0.6s]" />
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka Asisten AI Getara"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg shadow-accent/40 ring-2 ring-accent/30 transition-all duration-300 hover:scale-110 hover:bg-accent-hover hover:shadow-accent/60 active:scale-95"
        >
          <span
            className="transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            {open ? (
              <ChevronDown size={22} strokeWidth={2.5} />
            ) : (
              <span className="animate-wiggle inline-flex">
                <RobotIcon size={30} />
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Panel chatbot */}
      <div
        className={`fixed bottom-28 right-8 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-canvas-deep shadow-2xl shadow-black/50 transition-all duration-300 ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
        style={{ height: '480px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line/60 bg-surface px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-deep shadow shadow-black/30 ring-1 ring-accent/20">
            <RobotIcon size={26} />
          </span>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-bold text-slate-50">Asisten Getara</p>
            <p className="text-[11px] text-slate-400">
              AI ·{' '}
              <span className={provider === 'mistral' ? 'text-status-info' : 'text-accent/80'}>
                {provider === 'mistral' ? 'Mistral (fallback)' : 'Gemini Flash'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              title="Hapus riwayat chat"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-raised hover:text-slate-300"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Tutup"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-raised hover:text-slate-300"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2.5 text-xs">
              <p className="font-semibold text-status-warning">⚡ Server sedang sibuk</p>
              <p className="mt-0.5 text-slate-400">
                Kedua AI sedang high demand. Tunggu sebentar lalu coba lagi.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-status-warning/20 px-3 py-1.5 text-[11px] font-semibold text-status-warning transition-colors hover:bg-status-warning/30 disabled:opacity-40"
              >
                <Loader2 size={11} className={loading ? 'animate-spin' : ''} />
                Coba Lagi
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length === 1 && !error && (
          <div className="flex flex-wrap gap-1.5 border-t border-line/40 px-3 pb-2 pt-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] text-accent transition-colors hover:bg-accent/20"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-line/60 bg-surface px-3 py-3">
          <div className="flex items-end gap-2 rounded-xl border border-line bg-surface-raised px-3 py-2 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya sesuatu tentang mesin..."
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none disabled:opacity-50"
              style={{ maxHeight: '80px' }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-600">
            Enter untuk kirim · Shift+Enter baris baru
          </p>
        </div>
      </div>
    </>
  );
}
