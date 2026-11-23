// Deskripsi rancangan ketiga pendekatan AI. Semua berstatus RANCANGAN (belum diimplementasikan).

export const AI_MODELS = [
  {
    id: 'isolation_forest',
    name: 'Isolation Forest',
    category: 'AI Konvensional',
    tone: 'blue',
    status: 'Rancangan',
    library: 'scikit-learn (sklearn.ensemble.IsolationForest)',
    summary:
      'Algoritma berbasis pohon acak. Data yang "mudah diisolasi" (butuh sedikit potongan) dianggap anomali.',
    input: 'Vektor fitur per window: RMS X/Y/Z, peak, crest factor, kurtosis, energi pita frekuensi (FFT).',
    output: 'Skor anomali per window (tanpa memori urutan waktu).',
    steps: [
      'Potong sinyal menjadi window (mis. 1 detik).',
      'Hitung fitur statistik & frekuensi tiap window.',
      'Latih hanya dengan data normal (unsupervised).',
      'Window baru diberi skor; di atas ambang → anomali.',
    ],
    strengths: ['Sederhana dan cepat', 'Tersedia di scikit-learn', 'Baseline yang kuat untuk pembanding'],
    risks: ['Tidak memodelkan urutan waktu', 'Bergantung pada kualitas fitur', 'Baseline tetap (tidak adaptif)'],
  },
  {
    id: 'standard_esn',
    name: 'Standard ESN',
    category: 'Reservoir Computing',
    tone: 'cyan',
    status: 'Rancangan',
    library: 'ReservoirPy atau implementasi NumPy',
    summary:
      'Echo State Network: reservoir rekuren acak yang tetap (tidak dilatih). Hanya lapisan output (readout) yang dilatih.',
    input: 'Sekuens fitur atau sinyal yang sudah di-downsample, per langkah waktu.',
    output: 'Prediksi langkah berikutnya; error prediksi dipakai sebagai skor anomali.',
    steps: [
      'Input masuk ke reservoir rekuren acak berukuran N neuron.',
      'State reservoir menyimpan "jejak" input sebelumnya (echo state).',
      'Readout ridge regression dilatih memprediksi input berikutnya pada data normal.',
      'Error prediksi besar → pola tidak dikenal → anomali.',
    ],
    strengths: ['Menangkap pola temporal', 'Pelatihan murah (hanya readout)', 'Cocok untuk sinyal berurutan'],
    risks: ['Sensitif terhadap hyperparameter (spectral radius, leak rate)', 'Reservoir acak: hasil bervariasi antar seed'],
  },
  {
    id: 'drosophila_esn',
    name: 'Drosophila-inspired ESN',
    category: 'Neural-inspired',
    tone: 'violet',
    status: 'Rancangan — perlu diuji',
    library: 'Modifikasi ESN (NumPy / ReservoirPy)',
    summary:
      'ESN yang diberi tiga prinsip komputasi terinspirasi sirkuit mushroom body lalat buah. Tiap prinsip adalah komponen terpisah yang bisa diuji (ablation).',
    input: 'Sama dengan Standard ESN, agar perbandingan adil.',
    output: 'Skor anomali dari error prediksi, dibandingkan dengan baseline adaptif.',
    steps: [
      'Ekspansi jarang: tiap neuron reservoir hanya menerima sedikit input acak (terinspirasi koneksi PN → Kenyon cell).',
      'Aktivitas jarang: hanya k neuron paling aktif dipertahankan (k-winner-take-all, terinspirasi inhibisi global neuron APL).',
      'Baseline adaptif (habituasi): acuan normal diperbarui perlahan, HANYA jika skor rendah, agar anomali tidak ikut dipelajari.',
      'Bandingkan dengan Standard ESN: apakah tiap komponen menurunkan false alarm saat kecepatan motor berubah?',
    ],
    strengths: [
      'Dasar komputasi jelas dan dapat diuji per komponen',
      'Potensi adaptasi terhadap perubahan kondisi normal',
      'Representasi jarang → berpotensi lebih hemat komputasi',
    ],
    risks: [
      'Inspirasi biologis ≠ meniru otak lalat secara persis',
      'Baseline adaptif bisa "belajar" anomali jika gating salah',
      'Manfaatnya belum terbukti — harus dibuktikan eksperimen',
    ],
  },
];

export const EVAL_METRICS = [
  { key: 'precision', label: 'Precision', desc: 'Dari semua alarm, berapa yang benar anomali.', unit: '' },
  { key: 'recall', label: 'Recall', desc: 'Dari semua anomali, berapa yang terdeteksi.', unit: '' },
  { key: 'f1', label: 'F1-score', desc: 'Keseimbangan precision dan recall.', unit: '' },
  { key: 'falseAlarmRate', label: 'False Alarm Rate', desc: 'Seberapa sering alarm muncul pada kondisi normal.', unit: '' },
  { key: 'detectionLatencyMs', label: 'Detection Latency', desc: 'Waktu dari awal anomali hingga terdeteksi.', unit: 'ms' },
];

export const PIPELINE_STEPS = [
  { id: 'acq', title: 'Akuisisi', desc: 'ADXL345 → ESP32 (X, Y, Z)' },
  { id: 'tx', title: 'Transmisi', desc: 'Wi-Fi / MQTT (paket + seq)' },
  { id: 'pre', title: 'Preprocessing', desc: 'Buang offset gravitasi, windowing' },
  { id: 'feat', title: 'Fitur / Sekuens', desc: 'RMS, crest, FFT / urutan waktu' },
];

export const PIPELINE_TAIL = [
  { id: 'score', title: 'Skor Anomali', desc: 'Dinormalisasi 0–1' },
  { id: 'thr', title: 'Threshold', desc: 'Normal / Warning / Anomaly' },
  { id: 'out', title: 'Dashboard & Alert', desc: 'Visualisasi dan peringatan' },
];

export const EXPERIMENT_PROTOCOL = [
  'Gunakan dataset dan pembagian data yang sama untuk ketiga model.',
  'Bagi data berdasarkan SESI perekaman (bukan potongan acak) untuk mencegah kebocoran data.',
  'Latih model hanya dengan data normal; uji dengan data normal + unbalance + loose.',
  'Uji perubahan kecepatan normal untuk mengukur false alarm akibat pergeseran kondisi.',
  'Ulangi dengan beberapa seed acak (khusus ESN) dan laporkan rata-rata ± standar deviasi.',
  'Ablation Drosophila-ESN: matikan satu komponen tiap kali untuk melihat kontribusinya.',
];
