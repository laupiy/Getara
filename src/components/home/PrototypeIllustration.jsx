import { useApp } from '../../context/AppContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { box, cylinderX, iso, planeY, ringPath } from './iso';

const VB = { w: 615, h: 330 };

const C = {
  accent: '#f59e0b',
  line: '#4b5563',
  edge: '#374151',
  top: '#3a4655',
  left: '#2b3542',
  right: '#222b36',
  screen: '#11161d',
  muted: '#94a3b8',
  metal: '#7c8a9b',
};

/** Kotak isometrik 3 sisi */
function Box({ b, top = C.top, left = C.left, right = C.right, stroke = C.edge }) {
  return (
    <g stroke={stroke} strokeWidth="0.8" strokeLinejoin="round">
      <polygon points={b.left} fill={left} />
      <polygon points={b.right} fill={right} />
      <polygon points={b.top} fill={top} />
    </g>
  );
}

function Cylinder({ c, body = '#3b4756', cap = '#4b5868' }) {
  return (
    <g stroke={C.edge} strokeWidth="0.8">
      <polygon points={c.back} fill={body} />
      <polygon points={c.body} fill={body} stroke="none" />
      <polygon points={c.front} fill={cap} />
    </g>
  );
}

/** Isi tooltip / panel info komponen */
function ComponentInfo({ comp }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink">{comp.name}</p>
        <span className="rounded border border-line px-1.5 py-px text-[10px] text-muted">{comp.status}</span>
      </div>
      <p className="text-xs text-accent">{comp.role}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{comp.detail}</p>
    </>
  );
}

// ---------- Geometri scene (dihitung sekali) ----------
const G = {
  bench: box(0, 6, 0, 10, 5, 0.5),
  desk: box(11, 2, 0, 13.5, 6, 0.5),
  feet: box(1.6, 7.7, 0.5, 2.4, 1.6, 0.35),
  motor: cylinderX(1.2, 4.4, 8.5, 1.6, 1.05),
  shaft: cylinderX(4.4, 5.3, 8.5, 1.6, 0.14),
  disc: cylinderX(5.3, 5.6, 8.5, 1.6, 0.85),
  massPath: ringPath(5.6, 8.5, 1.6, 0.55),
  massStart: iso(5.6, 8.5 + 0.55, 1.6),
  sensor: box(2.3, 8.1, 2.65, 0.9, 0.8, 0.15),
  esp: box(6.8, 8.0, 0.5, 2.6, 1.2, 0.18),
  espChip: box(7.5, 8.3, 0.68, 0.9, 0.6, 0.12),
  router: box(11.8, 2.6, 0.5, 2.0, 1.3, 0.5),
  laptopBase: box(15, 4.2, 0.5, 3.6, 2.4, 0.15),
  laptopLid: box(15, 3.95, 0.65, 3.6, 0.22, 2.3),
  monStand: box(21.5, 4.75, 0.5, 1.0, 0.9, 0.08),
  monNeck: box(21.9, 4.95, 0.58, 0.2, 0.2, 0.9),
  monScreen: box(20.2, 5.2, 1.3, 3.6, 0.22, 2.3),
};

// Titik jangkar aliran data & penanda nomor
const A = {
  sensor: iso(2.75, 8.5, 2.8),
  esp: iso(9.2, 8.4, 0.9),
  router: iso(12.8, 3.2, 1.7),
  laptop: iso(16.8, 4.05, 3.0),
  dashboard: iso(22, 5.3, 3.7),
};

const MARKERS = {
  motor: iso(1.2, 9.6, 2.4),
  sensor: iso(2.75, 8.5, 4.1),
  esp32: iso(8.2, 8.6, 1.8),
  mqtt: iso(12.8, 3.2, 3.2),
  laptop: iso(16.8, 4.05, 4.2),
  dashboard: iso(22, 5.3, 4.9),
};

const arc = (p, q, lift) => {
  const mx = (p[0] + q[0]) / 2;
  const my = Math.min(p[1], q[1]) - lift;
  return `C ${mx} ${my}, ${mx} ${my}, ${q[0]} ${q[1]}`;
};
const DATA_PATH = [
  `M ${A.sensor[0]} ${A.sensor[1]}`,
  arc(A.sensor, A.esp, 40),
  arc(A.esp, A.router, 50),
  arc(A.router, A.laptop, 30),
  arc(A.laptop, A.dashboard, 25),
].join(' ');

/**
 * Ilustrasi semi-isometrik setup prototype.
 * @param {string|null} active  id komponen yang disorot
 * @param {(id:string|null)=>void} onActive
 * @param {{id,name,role}[]} components
 */
export default function PrototypeIllustration({ active, onActive, components }) {
  const { running } = useApp();
  const reduced = useReducedMotion();
  const animate = running && !reduced;

  // Props interaksi untuk setiap grup komponen (mouse, sentuh, keyboard)
  const hit = (id) => {
    const comp = components.find((c) => c.id === id);
    return {
      role: 'button',
      tabIndex: 0,
      'aria-label': `${comp?.name}: ${comp?.role}`,
      onMouseEnter: () => onActive(id),
      onFocus: () => onActive(id),
      onClick: () => onActive(id),
      onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onActive(id),
      className: 'cursor-pointer outline-none transition-opacity duration-200',
      style: { opacity: active && active !== id ? 0.35 : 1 },
    };
  };

  const activeComp = components.find((c) => c.id === active);
  const tip = active ? MARKERS[active] : null;
  // Tooltip digeser agar tidak keluar dari sisi kiri/kanan
  const tipShift = tip ? (tip[0] < 130 ? '-12%' : tip[0] > VB.w - 130 ? '-88%' : '-50%') : '-50%';

  return (
    <div className="relative" onMouseLeave={() => onActive(null)}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-auto w-full select-none" aria-label="Ilustrasi alur kerja prototype Getara">
        <defs>
          <pattern id="hiw-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.edge} strokeOpacity="0.3" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={VB.w} height={VB.h} fill="url(#hiw-grid)" />

        {/* Meja */}
        <Box b={G.desk} top="#2a3440" left="#222b35" right="#1c242d" />
        <Box b={G.bench} top="#2a3440" left="#222b35" right="#1c242d" />

        {/* 4. Wi-Fi / MQTT (router) */}
        <g {...hit('mqtt')}>
          <Box b={G.router} />
          {[12.2, 13.4].map((x) => {
            const p = iso(x, 2.7, 1.0);
            return <line key={x} x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] - 26} stroke={C.muted} strokeWidth="2" strokeLinecap="round" />;
          })}
          {[0, 1, 2].map((i) => {
            const [cx, cy] = iso(12.8, 2.7, 2.4);
            const r = 8 + i * 8;
            return (
              <path key={i} d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" opacity={0.8 - i * 0.25}>
                {animate && <animate attributeName="opacity" values={`${0.8 - i * 0.25};0.1;${0.8 - i * 0.25}`} dur="1.6s" begin={`${i * 0.25}s`} repeatCount="indefinite" />}
              </path>
            );
          })}
          {(() => {
            const p = iso(12.3, 3.9, 0.75);
            return [0, 1, 2].map((i) => <circle key={i} cx={p[0] + i * 9} cy={p[1] + i * 5} r="1.6" fill={i === 0 ? C.accent : '#22c55e'} />);
          })()}
        </g>

        {/* 5. Laptop (Python) */}
        <g {...hit('laptop')}>
          <Box b={G.laptopBase} />
          <Box b={G.laptopLid} left="#1f2833" />
          <g transform={planeY(15, 4.17, 0.65)}>
            <rect x="0.15" y="0.15" width="3.3" height="2.0" fill={C.screen} />
            {[0.4, 0.7, 1.0, 1.3, 1.6, 1.9].map((v, i) => (
              <rect key={v} x={0.3 + (i % 3) * 0.2} y={2.15 - v} width={[1.6, 2.2, 1.2, 1.9, 0.9, 1.5][i]} height="0.1" fill={i % 2 ? C.muted : C.accent} opacity={i % 2 ? 0.6 : 0.9} />
            ))}
          </g>
        </g>

        {/* 6. Dashboard (monitor) */}
        <g {...hit('dashboard')}>
          <Box b={G.monStand} />
          <Box b={G.monNeck} />
          <Box b={G.monScreen} left="#1f2833" />
          <g transform={planeY(20.2, 5.42, 1.3)}>
            <rect x="0.15" y="0.15" width="3.3" height="2.0" fill={C.screen} />
            <rect x="0.3" y="1.8" width="0.7" height="0.2" fill="#22c55e" opacity="0.8" />
            <rect x="1.1" y="1.8" width="0.9" height="0.2" fill={C.muted} opacity="0.5" />
            <polyline points="0.3,0.5 0.7,0.9 1.1,0.7 1.5,1.2 1.9,0.8 2.3,1.0 2.7,0.6 3.2,1.1" fill="none" stroke={C.accent} strokeWidth="0.06" />
          </g>
        </g>

        {/* 1. Motor + piringan uji */}
        <g {...hit('motor')}>
          <Box b={G.feet} />
          <Cylinder c={G.motor} />
          <Cylinder c={G.shaft} body={C.metal} cap="#9aa7b6" />
          <Cylinder c={G.disc} body="#2f3b48" cap="#3a4655" />
          <circle r="3.5" fill={C.accent} cx={animate ? 0 : G.massStart[0]} cy={animate ? 0 : G.massStart[1]}>
            {animate && <animateMotion dur="0.9s" repeatCount="indefinite" path={G.massPath} />}
          </circle>
          {[0, 1, 2].map((i) => {
            const [x, y] = iso(1.0, 10.2 + i * 0.5, 1.6);
            return (
              <path key={i} d={`M ${x} ${y - 16} Q ${x - 7} ${y} ${x} ${y + 16}`} fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" opacity={0.7 - i * 0.2}>
                {animate && <animate attributeName="opacity" values={`${0.7 - i * 0.2};0.1;${0.7 - i * 0.2}`} dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
              </path>
            );
          })}
        </g>

        {/* 2. Sensor ADXL345 */}
        <g {...hit('sensor')}>
          <Box b={G.sensor} top="#1f2937" left="#111827" right="#0b1220" stroke={C.accent} />
        </g>

        {/* 3. ESP32 */}
        <g {...hit('esp32')}>
          <Box b={G.esp} top="#1e293b" left="#141c28" right="#0f1620" />
          <Box b={G.espChip} top="#4b5563" />
          {(() => {
            const p = iso(9.15, 8.3, 0.69);
            return <path d={`M ${p[0] - 8} ${p[1] + 2} l3 -4 l3 4 l3 -4 l3 4`} fill="none" stroke={C.muted} strokeWidth="1" />;
          })()}
        </g>

        {/* Aliran data */}
        <path d={DATA_PATH} fill="none" stroke={C.accent} strokeWidth="1.6" strokeDasharray="5 7" opacity="0.75" pointerEvents="none">
          {animate && <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="0.8s" repeatCount="indefinite" />}
        </path>
        {animate &&
          [0, 1.4].map((b) => (
            <circle key={b} r="3.5" fill={C.accent} pointerEvents="none">
              <animateMotion dur="2.8s" begin={`${b}s`} repeatCount="indefinite" path={DATA_PATH} />
            </circle>
          ))}

        {/* Penanda nomor */}
        {components.map((c, i) => {
          const [x, y] = MARKERS[c.id];
          const on = active === c.id;
          return (
            <g key={c.id} {...hit(c.id)} style={{ opacity: 1 }}>
              <circle cx={x} cy={y} r="11" fill={on ? C.accent : '#161c24'} stroke={C.accent} strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill={on ? '#161c24' : C.accent}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip (desktop) */}
      {activeComp && tip && (
        <div
          className="pointer-events-none absolute z-10 hidden w-64 rounded-lg border border-line bg-canvas/95 p-3 shadow-xl shadow-black/40 backdrop-blur md:block"
          style={{
            left: `${(tip[0] / VB.w) * 100}%`,
            top: `${(tip[1] / VB.h) * 100}%`,
            transform: `translate(${tipShift}, calc(-100% - 16px))`,
          }}
        >
          <ComponentInfo comp={activeComp} />
        </div>
      )}

      {/* Panel info (mobile): tooltip melayang disembunyikan di layar kecil */}
      <div className="mt-3 rounded-lg border border-line bg-canvas/80 p-3 md:hidden">
        {activeComp ? (
          <ComponentInfo comp={activeComp} />
        ) : (
          <p className="text-xs text-muted">Ketuk komponen atau nomor pada ilustrasi untuk melihat penjelasannya.</p>
        )}
      </div>
    </div>
  );
}