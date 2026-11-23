// =====================================================================
// DATA DUMMY STATIS: alert awal, riwayat pengujian, dan daftar perangkat.
// Semua nilai di file ini adalah SIMULASI, bukan hasil pengujian asli.
// =====================================================================
import { mulberry32 } from '../utils/random';
import { SPEED_LEVELS } from './vibrationSimulator';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function buildMockAlerts(now = Date.now()) {
  return [
    {
      id: 'AL-SEED-006',
      timestamp: now - 25 * MIN,
      severity: 'high',
      type: 'Unbalance (simulasi)',
      title: 'RMS getaran radial meningkat',
      message: 'RMS total sekitar 3× baseline normal pada kecepatan sedang.',
      status: 'open',
      read: false,
      source: 'simulation',
      metrics: { score: 0.74, rmsTotal: 0.248, crestFactor: 1.6, ratio: 3.1 },
      scenario: 'unbalance',
      speed: 'medium',
    },
    {
      id: 'AL-SEED-005',
      timestamp: now - 2 * HOUR,
      severity: 'medium',
      type: 'Loose Mounting (simulasi)',
      title: 'Impuls acak terdeteksi',
      message: 'Crest factor tinggi dan muncul harmonik 2×/3× RPM.',
      status: 'acknowledged',
      read: true,
      source: 'simulation',
      metrics: { score: 0.48, rmsTotal: 0.16, crestFactor: 3.9, ratio: 1.9 },
      scenario: 'loose',
      speed: 'medium',
    },
    {
      id: 'AL-SEED-004',
      timestamp: now - 5 * HOUR,
      severity: 'critical',
      type: 'Unbalance (simulasi)',
      title: 'Skor anomali sangat tinggi',
      message: 'Getaran 1× RPM sangat dominan pada kecepatan tinggi.',
      status: 'resolved',
      read: true,
      source: 'simulation',
      metrics: { score: 0.91, rmsTotal: 0.39, crestFactor: 1.5, ratio: 3.3 },
      scenario: 'unbalance',
      speed: 'high',
    },
    {
      id: 'AL-SEED-003',
      timestamp: now - 1 * DAY - 3 * HOUR,
      severity: 'medium',
      type: 'Deviasi RMS (simulasi)',
      title: 'RMS sedikit di atas baseline',
      message: 'Kenaikan kecil, kemungkinan transien saat perubahan kecepatan.',
      status: 'resolved',
      read: true,
      source: 'simulation',
      metrics: { score: 0.38, rmsTotal: 0.11, crestFactor: 2.4, ratio: 1.6 },
      scenario: 'normal',
      speed: 'low',
    },
    {
      id: 'AL-SEED-002',
      timestamp: now - 2 * DAY,
      severity: 'high',
      type: 'Loose Mounting (simulasi)',
      title: 'Pola getaran tidak stabil',
      message: 'Sumbu Z menunjukkan impuls berulang.',
      status: 'open',
      read: false,
      source: 'simulation',
      metrics: { score: 0.66, rmsTotal: 0.21, crestFactor: 4.2, ratio: 2.2 },
      scenario: 'loose',
      speed: 'high',
    },
  ];
}

const CONDITIONS = ['normal', 'normal', 'unbalance', 'loose'];
const OPERATORS = ['Operator A', 'Operator B'];

export function buildMockHistory(now = Date.now(), count = 28) {
  const rng = mulberry32(2026);
  const sessions = [];
  for (let i = 0; i < count; i += 1) {
    const condition = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    const speed = SPEED_LEVELS[Math.floor(rng() * SPEED_LEVELS.length)];
    const base = 0.04 + 0.08 * (speed.rpm / 9000);
    const factor = condition === 'normal' ? 1 : condition === 'unbalance' ? 3.1 : 1.9;
    const avgRms = base * 0.95 * factor * (0.92 + 0.16 * rng());
    const durationSec = 60 + Math.floor(rng() * 9) * 30;
    const scoreBase = condition === 'normal' ? 0.05 : condition === 'unbalance' ? 0.72 : 0.52;
    sessions.push({
      id: `SIM-${String(count - i).padStart(3, '0')}`,
      startedAt: now - i * 0.5 * DAY - Math.floor(rng() * 6) * HOUR,
      condition,
      speed: speed.id,
      rpm: speed.rpm,
      pwm: speed.pwm,
      durationSec,
      sampleRate: 1600, // rencana ODR ADXL345 untuk perekaman dataset asli
      sampleCount: durationSec * 1600,
      avgRms: Number(avgRms.toFixed(4)),
      peakRms: Number((avgRms * (1.2 + 0.4 * rng())).toFixed(4)),
      maxTempC: Number((30 + 6 * (speed.rpm / 9000) + (condition === 'unbalance' ? 5 : 2) * rng()).toFixed(1)),
      avgScore: Number(Math.min(1, scoreBase + 0.1 * rng()).toFixed(2)),
      operator: OPERATORS[Math.floor(rng() * OPERATORS.length)],
      seed: Math.floor(rng() * 1e6),
      source: 'simulation',
      notes: 'Sesi dummy untuk demonstrasi UI. Belum ada perekaman data asli.',
    });
  }
  return sessions;
}

export const MOCK_DEVICES = [
  {
    id: 'motor-dc-12v',
    kind: 'actuator',
    name: 'Motor DC 12V',
    role: 'Objek mesin yang dipantau',
    connection: 'simulated',
    optional: false,
    specs: [
      ['Tegangan nominal', '12 V DC'],
      ['Kecepatan (asumsi simulasi)', '3.000 / 6.000 / 9.000 RPM'],
      ['Kontrol kecepatan', 'PWM melalui driver motor'],
      ['Arus kerja', 'Belum diukur'],
      ['Datasheet', 'Sesuaikan dengan motor yang dipakai'],
    ],
    notes: 'Nilai RPM di atas hanya asumsi simulasi. Ukur RPM asli dengan tachometer atau sensor optik.',
  },
  {
    id: 'esp32',
    kind: 'controller',
    name: 'ESP32 DevKit',
    role: 'Membaca sensor dan mengirim data via Wi-Fi/MQTT',
    connection: 'simulated',
    optional: false,
    specs: [
      ['CPU', 'Dual-core Xtensa LX6, hingga 240 MHz'],
      ['SRAM', '520 KB'],
      ['Konektivitas', 'Wi-Fi 802.11 b/g/n, Bluetooth'],
      ['Logika I/O', '3,3 V'],
      ['I2C default', 'SDA GPIO21, SCL GPIO22'],
      ['Device ID (rencana)', 'esp32-vg-01'],
    ],
    notes: 'Firmware MQTT belum dibuat. Status "Simulated" berarti data berasal dari simulator di browser.',
  },
  {
    id: 'adxl345',
    kind: 'sensor',
    name: 'ADXL345 Accelerometer',
    role: 'Mengukur getaran 3 sumbu (X, Y, Z)',
    connection: 'simulated',
    optional: false,
    specs: [
      ['Sumbu', '3 (X, Y, Z)'],
      ['Rentang', '±2 / ±4 / ±8 / ±16 g (rencana: ±4 g)'],
      ['Resolusi', 'Hingga 13-bit, full resolution ±3,9 mg/LSB'],
      ['Output data rate', 'Hingga 3.200 Hz (rencana: 1.600 Hz)'],
      ['Antarmuka', 'I2C (alamat 0x53) / SPI'],
      ['Tegangan suplai', '2,0 – 3,6 V'],
    ],
    notes: 'Wiring I2C: VCC→3V3, GND→GND, SDA→GPIO21, SCL→GPIO22, CS→3V3, SDO→GND.',
  },
  {
    id: 'ds18b20',
    kind: 'sensor',
    name: 'DS18B20 Temperature',
    role: 'Suhu motor (opsional)',
    connection: 'simulated',
    optional: true,
    specs: [
      ['Rentang', '−55 hingga +125 °C'],
      ['Akurasi', '±0,5 °C (−10 hingga +85 °C)'],
      ['Antarmuka', '1-Wire'],
      ['Resolusi', '9 – 12 bit'],
      ['Waktu konversi', '±750 ms pada 12-bit'],
      ['Pull-up', 'Resistor 4,7 kΩ ke 3V3'],
    ],
    notes: 'Opsional. Ditambahkan setelah pembacaan getaran berjalan stabil.',
  },
];

/** Profil RMS dummy untuk satu sesi (deterministik dari seed sesi). */
export function buildSessionProfile(session, points = 40) {
  const rng = mulberry32(session.seed);
  const out = [];
  for (let i = 0; i < points; i += 1) {
    const t = Math.round((i / (points - 1)) * session.durationSec);
    const wobble = 0.9 + 0.2 * rng();
    const impulse = session.condition === 'loose' && rng() < 0.12 ? 1.3 : 1;
    out.push({ time: `${t}s`, rms: Number((session.avgRms * wobble * impulse).toFixed(4)) });
  }
  return out;
}
