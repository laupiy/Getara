// =====================================================================
// SIMULATOR GETARAN (DATA DUMMY)
// Menghasilkan sinyal sintetis yang MENIRU pola umum getaran motor.
// Ini BUKAN data sensor asli. Nanti diganti oleh paket dari ESP32 (MQTT)
// dengan bentuk paket yang sama (lihat src/services/schema.js).
// =====================================================================
import { gaussian } from '../utils/random';

export const SIM_SAMPLE_RATE = 1000; // Hz — laju sampel simulasi untuk tampilan
export const SIM_WINDOW_SIZE = 64; // jumlah sampel per paket

export const SCENARIOS = [
  {
    id: 'normal',
    label: 'Normal',
    short: 'Motor berjalan tanpa gangguan.',
    signature: 'Komponen 1× RPM kecil dan noise rendah.',
  },
  {
    id: 'unbalance',
    label: 'Unbalance',
    short: 'Massa tidak seimbang pada bagian yang berputar.',
    signature: 'Amplitudo 1× RPM naik kuat pada sumbu radial (X, Y).',
  },
  {
    id: 'loose',
    label: 'Loose Mounting',
    short: 'Dudukan motor sedikit longgar.',
    signature: 'Muncul harmonik 2×/3× RPM, impuls acak, dan noise lebih tinggi.',
  },
];

export const SPEED_LEVELS = [
  { id: 'low', label: 'Rendah', pwm: 40, rpm: 3000 },
  { id: 'medium', label: 'Sedang', pwm: 70, rpm: 6000 },
  { id: 'high', label: 'Tinggi', pwm: 100, rpm: 9000 },
];

export const getScenario = (id) => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
export const getSpeed = (id) => SPEED_LEVELS.find((s) => s.id === id) ?? SPEED_LEVELS[1];

const TEMP_OFFSET = { normal: 0, unbalance: 6, loose: 3 };
const r4 = (v) => Math.round(v * 10000) / 10000;

export function createVibrationSimulator({
  scenario = 'normal',
  speed = 'medium',
  deviceId = 'esp32-vg-01',
  rng = Math.random,
} = {}) {
  const state = { scenario, speed, t: 0, seq: 0, temp: 29, impulse: 0 };

  function sampleAt(t) {
    const { rpm } = getSpeed(state.speed);
    const w = 2 * Math.PI * (rpm / 60) * t; // fase putaran (1× RPM)
    const base = 0.04 + 0.08 * (rpm / 9000); // amplitudo dasar (g), naik dengan kecepatan
    let noise = 0.015;

    let x = base * Math.sin(w);
    let y = 0.8 * base * Math.cos(w);
    let z = 0.3 * base * Math.sin(2 * w);

    if (state.scenario === 'unbalance') {
      x = 3.2 * base * Math.sin(w);
      y = 2.8 * base * Math.cos(w);
    }

    if (state.scenario === 'loose') {
      x += 1.2 * base * Math.sin(2 * w + 0.4) + 0.6 * base * Math.sin(3 * w);
      y += 0.9 * base * Math.sin(2 * w + 1.1);
      z += 1.4 * base * Math.sin(2 * w) + 0.7 * base * Math.sin(3 * w + 0.3);
      noise = 0.035;
      if (rng() < 0.03) state.impulse = (rng() < 0.5 ? -1 : 1) * (0.3 + 0.4 * rng());
      x += state.impulse * 0.6;
      y += state.impulse * 0.4;
      z += state.impulse;
      state.impulse *= 0.6; // impuls meluruh cepat
    }

    return {
      x: x + noise * gaussian(rng),
      y: y + noise * gaussian(rng),
      z: 1 + z + noise * gaussian(rng), // +1 g gravitasi (sensor terpasang mendatar)
    };
  }

  function nextPacket() {
    const xs = [];
    const ys = [];
    const zs = [];
    const dt = 1 / SIM_SAMPLE_RATE;
    for (let i = 0; i < SIM_WINDOW_SIZE; i += 1) {
      const s = sampleAt(state.t);
      xs.push(r4(s.x));
      ys.push(r4(s.y));
      zs.push(r4(s.z));
      state.t += dt;
    }

    const { rpm } = getSpeed(state.speed);
    const target = 28 + 8 * (rpm / 9000) + TEMP_OFFSET[state.scenario];
    state.temp += (target - state.temp) * 0.03 + 0.04 * gaussian(rng);
    state.seq += 1;

    return {
      deviceId,
      seq: state.seq,
      timestamp: Date.now(),
      sampleRate: SIM_SAMPLE_RATE,
      unit: 'g',
      samples: { x: xs, y: ys, z: zs },
      temperatureC: Math.round(state.temp * 100) / 100,
      meta: { scenario: state.scenario, speed: state.speed, rpm },
      source: 'simulation',
    };
  }

  return {
    nextPacket,
    setScenario: (id) => {
      state.scenario = id;
    },
    setSpeed: (id) => {
      state.speed = id;
    },
    reset: () => {
      Object.assign(state, { t: 0, seq: 0, temp: 29, impulse: 0 });
    },
  };
}
