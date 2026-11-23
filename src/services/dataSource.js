// =====================================================================
// LAPISAN SUMBER DATA
// Semua komponen UI mengambil data lewat file ini.
// Sekarang: DATA_MODE = 'simulation'.
// Nanti: ganti isi fungsi di bawah dengan fetch() ke API atau koneksi MQTT
// over WebSocket, tanpa perlu mengubah komponen UI.
// =====================================================================
import { createVibrationSimulator } from '../simulation/vibrationSimulator';
import { buildMockAlerts, buildMockHistory, buildSessionProfile, MOCK_DEVICES } from '../simulation/mockData';
import { EMPTY_EVALUATION } from './schema';

export const DATA_MODE = 'simulation'; // 'simulation' | 'api'

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => JSON.parse(JSON.stringify(v));

/** Sumber telemetri. Mode API nanti: berlangganan topik MQTT dan memanggil callback. */
export function createTelemetrySource(options) {
  if (DATA_MODE === 'simulation') return createVibrationSimulator(options);
  throw new Error('Mode API belum diimplementasikan');
}

export async function fetchAlerts() {
  await delay(100);
  return buildMockAlerts();
}

export async function fetchHistory() {
  await delay(100);
  return buildMockHistory();
}

/** Profil RMS satu sesi. Mode API nanti: GET /sessions/:id/profile */
export function getSessionProfile(session) {
  return buildSessionProfile(session);
}

export async function fetchDevices() {
  await delay(100);
  return clone(MOCK_DEVICES);
}

/** Belum ada eksperimen -> semua metrik null ("Not Tested"). */
export async function fetchEvaluationResults() {
  await delay(100);
  return {
    isolation_forest: { ...EMPTY_EVALUATION },
    standard_esn: { ...EMPTY_EVALUATION },
    drosophila_esn: { ...EMPTY_EVALUATION },
  };
}

/** Uji koneksi perangkat. Dalam mode simulasi selalu menjelaskan bahwa hardware belum terhubung. */
export async function testDeviceConnection(deviceId) {
  await delay(700);
  return {
    deviceId,
    ok: false,
    mode: DATA_MODE,
    message:
      'Mode simulasi: koneksi hardware dan broker MQTT belum diintegrasikan. Data yang tampil berasal dari simulator.',
    checkedAt: Date.now(),
  };
}
