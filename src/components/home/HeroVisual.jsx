import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fmt } from '../../utils/format';
import { MACHINE_STATUS } from '../../utils/status';

const C = {
  accent: '#f59e0b',
  line: '#374151',
  body: '#3b4756',
  bodyDark: '#2f3b48',
  surface: '#26313d',
  canvas: '#161c24',
  muted: '#94a3b8',
};

// Gelombang sinus untuk panel "osiloskop" kecil (2 periode lebih panjang dari panel agar bisa digeser)
function wavePoints(width, period, amp, midY) {
  const pts = [];
  for (let x = 0; x <= width + period * 2; x += 2) {
    pts.push(`${x},${(midY + amp * Math.sin((2 * Math.PI * x) / period)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Ilustrasi teknis ringan: motor + ADXL345 + ESP32 + aliran data. Animasi dimatikan jika pengguna memilih reduced motion. */
export default function HeroVisual() {
  const { telemetry, running } = useApp();
  const animate = useMemo(
    () => typeof window === 'undefined' || !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const wave = useMemo(() => wavePoints(170, 34, 14, 40), []);
  const status = MACHINE_STATUS[telemetry.status] ?? MACHINE_STATUS.idle;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-4 shadow-2xl shadow-black/30">
      <svg viewBox="0 0 520 330" className="h-auto w-full" role="img" aria-label="Ilustrasi prototype VibeGuard: motor DC, sensor ADXL345, dan ESP32">
        <defs>
          <pattern id="vg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke={C.line} strokeOpacity="0.35" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="vg-motor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b5868" />
            <stop offset="55%" stopColor={C.body} />
            <stop offset="100%" stopColor={C.bodyDark} />
          </linearGradient>
          <clipPath id="vg-wave-clip">
            <rect x="0" y="0" width="170" height="80" />
          </clipPath>
        </defs>

        <rect width="520" height="330" fill="url(#vg-grid)" />

        {/* Panel osiloskop */}
        <g transform="translate(320 24)">
          <rect width="180" height="96" rx="8" fill={C.canvas} stroke={C.line} />
          <text x="10" y="16" fill={C.muted} fontSize="9" fontFamily="JetBrains Mono, monospace">ACCEL · SIMULASI</text>
          <g transform="translate(5 12)" clipPath="url(#vg-wave-clip)">
            <polyline points={wave} fill="none" stroke={C.accent} strokeWidth="1.8">
              {animate && running && (
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-34 0" dur="0.7s" repeatCount="indefinite" />
              )}
            </polyline>
          </g>
        </g>

        {/* Pelat dudukan */}
        <rect x="30" y="250" width="460" height="18" rx="4" fill={C.bodyDark} stroke={C.line} />
        {[50, 470].map((x) => (
          <circle key={x} cx={x} cy="259" r="4" fill={C.canvas} stroke={C.line} />
        ))}

        {/* Bracket + motor */}
        <path d="M95 250 L105 205 H225 L235 250 Z" fill={C.surface} stroke={C.line} />
        <rect x="80" y="130" width="170" height="90" rx="14" fill="url(#vg-motor)" stroke="#4b5563" />
        {[105, 125, 145, 165, 185, 205, 225].map((x) => (
          <line key={x} x1={x} y1="138" x2={x} y2="212" stroke={C.line} strokeWidth="1.5" />
        ))}
        <ellipse cx="250" cy="175" rx="12" ry="44" fill={C.body} stroke="#4b5563" />
        <rect x="258" y="169" width="38" height="12" rx="2" fill={C.muted} />

        {/* Piringan uji dengan massa (simulasi unbalance) */}
        <g>
          {animate && running && (
            <animateTransform attributeName="transform" type="rotate" from="0 312 175" to="360 312 175" dur="0.9s" repeatCount="indefinite" />
          )}
          <circle cx="312" cy="175" r="30" fill={C.surface} stroke={C.muted} strokeWidth="1.5" />
          <circle cx="312" cy="175" r="5" fill={C.muted} />
          <circle cx="326" cy="155" r="5" fill={C.accent} />
        </g>

        {/* Garis getaran */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${62 - i * 9} 145 Q${52 - i * 9} 175 ${62 - i * 9} 205`}
            fill="none"
            stroke={C.accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={0.7 - i * 0.2}
          >
            {animate && running && (
              <animate attributeName="opacity" values={`${0.7 - i * 0.2};0.1;${0.7 - i * 0.2}`} dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            )}
          </path>
        ))}

        {/* Sensor ADXL345 di atas motor + sumbu */}
        <rect x="140" y="111" width="44" height="20" rx="3" fill="#1f2937" stroke={C.accent} strokeWidth="1.5" />
        <rect x="155" y="116" width="14" height="10" rx="1" fill={C.line} />
        <g stroke={C.muted} strokeWidth="1.2" fill={C.muted} fontSize="9" fontFamily="JetBrains Mono, monospace">
          <line x1="162" y1="111" x2="162" y2="88" />
          <text x="158" y="83" stroke="none">z</text>
          <line x1="184" y1="121" x2="204" y2="121" />
          <text x="207" y="124" stroke="none">x</text>
          <line x1="140" y1="121" x2="124" y2="108" />
          <text x="114" y="106" stroke="none">y</text>
        </g>

        {/* Kabel I2C sensor -> ESP32 dengan aliran data */}
        <path d="M184 116 C 250 70, 380 90, 405 222" fill="none" stroke={C.accent} strokeWidth="1.6" strokeDasharray="5 6" opacity="0.85">
          {animate && running && (
            <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.8s" repeatCount="indefinite" />
          )}
        </path>

        {/* ESP32 */}
        <rect x="360" y="222" width="104" height="28" rx="3" fill="#1e293b" stroke="#4b5563" />
        <rect x="392" y="228" width="32" height="16" rx="1.5" fill={C.line} />
        <path d="M440 230 h4 v8 h4 v-8 h4 v8 h4" fill="none" stroke={C.muted} strokeWidth="1.2" />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${438 - i * 7} ${206 - i * 7} a ${12 + i * 10} ${12 + i * 10} 0 0 1 ${24 + i * 20} 0`}
            fill="none"
            stroke={C.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.8 - i * 0.25}
          >
            {animate && running && (
              <animate attributeName="opacity" values={`${0.8 - i * 0.25};0.15;${0.8 - i * 0.25}`} dur="1.6s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            )}
          </path>
        ))}

        {/* Label */}
        <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill={C.muted}>
          <text x="80" y="292">MOTOR DC 12V</text>
          <text x="132" y="62">ADXL345</text>
          <line x1="152" y1="66" x2="158" y2="84" stroke={C.muted} strokeWidth="0.8" />
          <text x="360" y="292">ESP32 → Wi-Fi / MQTT</text>
        </g>
      </svg>

      {/* Readout dari simulasi terpusat (AppContext) */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-2 font-mono text-xs">
        <span className="text-muted">
          RMS <span className="text-ink">{fmt(telemetry.features?.rmsTotal, 3)} g</span>
        </span>
        <span className="text-muted">
          Status <span className="text-ink">{status.label}</span>
        </span>
        <span className="rounded border border-dashed border-accent/50 px-1.5 py-px text-[10px] tracking-wider text-accent">
          SIMULASI
        </span>
      </div>
    </div>
  );
}