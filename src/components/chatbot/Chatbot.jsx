import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { ChevronDown, Trash2, X, Loader2, Send, AlertTriangle } from 'lucide-react';
import MarkdownView from './MarkdownView';

// Lazy-load maskot 3D agar pustaka Three.js (~600KB) tidak membebani bundle awal
const YetiMascot = lazy(() => import('./YetiMascot'));

let lastProvider = 'gemini';

// ---- Pemanggilan AI melalui Backend Proxy (/api/chat) ----
// Menjaga API Key tetap aman di sisi server dan tidak terekspos ke browser
async function sendToAI(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(25000),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Terjadi kesalahan (HTTP ${res.status})`);
    err.code = data.code;
    err.provider = data.provider;
    throw err;
  }

  if (data.provider) lastProvider = data.provider;
  return data.reply || '(Tidak ada balasan dari asisten)';
}

// Helper untuk menghasilkan pesan error yang spesifik dan solutif
function getErrorMessage(err) {
  const msg = err?.message || String(err || '');
  const code = err?.code;

  if (code === 'API_KEY_MISSING' || msg.includes('API_KEY') || msg.includes('Kunci API')) {
    return {
      title: 'Kunci API Belum Dikonfigurasi',
      desc: 'Tambahkan GEMINI_API_KEY atau MISTRAL_API_KEY di file .env proyek agar asisten AI dapat menjawab.',
    };
  }
  if (code === 'RATE_LIMIT' || msg.includes('429') || msg.includes('quota') || msg.includes('ResourceExhausted')) {
    return {
      title: 'Batas Panggilan Tercapai (Rate Limit)',
      desc: 'Kuota API sedang penuh atau mencapai batas panggilan. Mohon tunggu 1–2 menit sebelum mencoba lagi.',
    };
  }
  if (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('timeout') ||
    msg.includes('AbortError') ||
    msg.includes('jaringan')
  ) {
    return {
      title: 'Koneksi Terputus / Waktu Habis',
      desc: 'Gagal terhubung ke backend proxy (/api/chat). Periksa koneksi internet atau jalankan server lokal.',
    };
  }
  return {
    title: 'Gagal Memproses Jawaban',
    desc: msg || 'Terjadi gangguan saat memproses jawaban AI. Silakan coba lagi.',
  };
}

// Ikon Maskot Yeti 3D
function RobotIcon({ size = 36, animated = false }) {
  return (
    <Suspense fallback={<span className="inline-block" style={{ width: size, height: size }} />}>
      <YetiMascot size={size} animated={animated} />
    </Suspense>
  );
}

// ---- Bubble Pesan ----
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
          <RobotIcon size={32} />
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-accent text-on-accent'
            : 'rounded-tl-sm bg-surface-raised text-slate-200'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <MarkdownView content={msg.content} />
        )}
      </div>
    </div>
  );
}

// ---- Indikator Mengetik ----
function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
        <RobotIcon size={32} />
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
  'Status Waspada artinya apa?',
  'Tips predictive maintenance?',
];

// ---- Komponen Utama Chatbot ----
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Halo! Saya asisten AI Getara.\nSaya siap membantu kamu memahami data monitoring mesin, alert, dan analisis getaran. Ada yang bisa saya bantu?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Dukungan menutup panel chat dengan tombol Escape
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [open]);

  const doSend = async (newMessages) => {
    setLoading(true);
    setError(null);
    setLastFailedMessages(null);
    try {
      const reply = await sendToAI(newMessages);
      setProvider(lastProvider);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(getErrorMessage(e));
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
    setMessages([{ role: 'assistant', content: 'Chat direset. Saya siap membantu lagi.' }]);
    setError(null);
    setLastFailedMessages(null);
  };

  return (
    <>
      {/* Tombol buka chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup Asisten AI Getara' : 'Buka Asisten AI Getara'}
          className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
            open
              ? 'h-12 w-12 rounded-full bg-surface-raised text-slate-200 shadow-lg shadow-black/40'
              : 'h-20 w-20 drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]'
          }`}
        >
          {open ? (
            <ChevronDown size={22} strokeWidth={2.5} />
          ) : (
            <span className="animate-wiggle">
              <RobotIcon size={76} animated />
            </span>
          )}
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <RobotIcon size={38} />
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
              title="Tutup (Esc)"
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
            <div className="rounded-lg bg-status-warning/10 p-3 text-xs text-status-warning">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={13} /> {error.title}
              </p>
              <p className="mt-1 text-slate-300 leading-relaxed">{error.desc}</p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="mt-2.5 flex items-center gap-1.5 rounded-md bg-status-warning/20 px-3 py-1.5 text-[11px] font-semibold text-status-warning transition-colors hover:bg-status-warning/30 disabled:opacity-40"
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
          <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/25"
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
              aria-label="Kirim pesan"
              className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Enter untuk kirim · Shift+Enter baris baru · Esc untuk tutup
          </p>
        </div>
      </div>
    </>
  );
}
