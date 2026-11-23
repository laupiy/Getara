// Fungsi pengolahan sinyal sederhana.
// Fungsi ini juga akan dipakai untuk data sensor asli nanti (bukan khusus simulasi).

export function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// RMS komponen AC: rata-rata dibuang dulu agar gravitasi (±1 g) tidak ikut terhitung
export function rmsAC(arr) {
  if (!arr.length) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

export function peakAC(arr) {
  const m = mean(arr);
  return arr.reduce((p, v) => Math.max(p, Math.abs(v - m)), 0);
}

/**
 * Ekstraksi fitur dari satu paket (window) getaran.
 * @param {{samples:{x:number[],y:number[],z:number[]}}} packet
 */
export function computeFeatures(packet) {
  const { x, y, z } = packet.samples;
  const rmsX = rmsAC(x);
  const rmsY = rmsAC(y);
  const rmsZ = rmsAC(z);
  const rmsTotal = Math.sqrt(rmsX ** 2 + rmsY ** 2 + rmsZ ** 2);
  const peaks = [peakAC(x), peakAC(y), peakAC(z)];
  const rmsArr = [rmsX, rmsY, rmsZ];
  // Crest factor = puncak / RMS. Tinggi jika ada impuls (kejutan) pada sinyal.
  const crestFactor = Math.max(...peaks.map((p, i) => (rmsArr[i] > 0 ? p / rmsArr[i] : 0)));
  return { rmsX, rmsY, rmsZ, rmsTotal, peak: Math.max(...peaks), crestFactor };
}

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
