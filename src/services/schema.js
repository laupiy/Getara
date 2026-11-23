// =====================================================================
// KONTRAK DATA (untuk integrasi API / MQTT nanti)
// UI hanya bergantung pada bentuk data di bawah ini, bukan pada simulator.
// Saat hardware siap, backend/MQTT cukup mengirim data dengan bentuk yang sama.
// =====================================================================

/**
 * Paket telemetri getaran dari ESP32 (rencana payload MQTT topik `vibeguard/<deviceId>/vibration`).
 * @typedef {Object} TelemetryPacket
 * @property {string} deviceId      contoh "esp32-vg-01"
 * @property {number} seq           nomor urut paket, untuk mendeteksi paket hilang
 * @property {number} timestamp     epoch ms
 * @property {number} sampleRate    Hz
 * @property {'g'} unit
 * @property {{x:number[], y:number[], z:number[]}} samples
 * @property {number|null} temperatureC   null jika DS18B20 tidak dipakai
 * @property {'simulation'|'device'} source
 */

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {number} timestamp
 * @property {'low'|'medium'|'high'|'critical'} severity
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {'open'|'acknowledged'|'resolved'} status
 * @property {boolean} read
 * @property {'simulation'|'heuristic'|'isolation_forest'|'esn'|'drosophila_esn'} source
 * @property {{score:number, rmsTotal:number, crestFactor:number, ratio:number}} metrics
 */

/**
 * @typedef {Object} TestSession
 * @property {string} id
 * @property {number} startedAt
 * @property {'normal'|'unbalance'|'loose'} condition
 * @property {string} speed
 * @property {number} rpm
 * @property {number} durationSec
 * @property {number} sampleRate
 * @property {number} sampleCount
 * @property {number} avgRms
 * @property {number} peakRms
 * @property {number} maxTempC
 * @property {number} avgScore
 * @property {'simulation'|'device'} source
 */

/**
 * Hasil evaluasi model. `null` = belum diuji (ditampilkan "Not Tested").
 * @typedef {Object} ModelEvaluation
 * @property {number|null} precision
 * @property {number|null} recall
 * @property {number|null} f1
 * @property {number|null} falseAlarmRate
 * @property {number|null} detectionLatencyMs
 * @property {string|null} datasetVersion
 * @property {number|null} evaluatedAt
 */

export const EMPTY_EVALUATION = Object.freeze({
  precision: null,
  recall: null,
  f1: null,
  falseAlarmRate: null,
  detectionLatencyMs: null,
  datasetVersion: null,
  evaluatedAt: null,
});
