// =====================================================================
// SKOR ANOMALI HEURISTIK (PLACEHOLDER)
// Ini BUKAN output Isolation Forest / ESN. Hanya aturan sederhana:
// membandingkan RMS terhadap baseline normal + memperhitungkan crest factor.
// Tujuannya agar dashboard bisa didemokan sebelum model AI dibuat.
// =====================================================================
import { computeFeatures, clamp } from '../utils/signal';
import { createVibrationSimulator } from './vibrationSimulator';

/**
 * Kalibrasi baseline: rata-rata RMS dari data NORMAL simulasi pada kecepatan tertentu.
 * Konsepnya sama dengan yang akan dilakukan pada data asli: acuan normal per kecepatan.
 */
export function calibrateBaseline(speed, packets = 40) {
  const sim = createVibrationSimulator({ scenario: 'normal', speed });
  let sum = 0;
  for (let i = 0; i < packets; i += 1) sum += computeFeatures(sim.nextPacket()).rmsTotal;
  return sum / packets;
}

export function heuristicAnomalyScore(features, baselineRms) {
  const ratio = baselineRms > 0 ? features.rmsTotal / baselineRms : 1;
  const energyTerm = clamp((ratio - 1.15) / 1.5); // seberapa jauh energi getaran naik
  const impulseTerm = clamp((features.crestFactor - 2.2) / 2.5); // seberapa "berimpuls" sinyalnya
  return { score: clamp(0.7 * energyTerm + 0.3 * impulseTerm), ratio };
}
