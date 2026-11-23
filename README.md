# VibeGuard Dashboard — Smart Machine Health Monitoring System

Dashboard prototype untuk VibeGuard (React + Vite + Tailwind CSS v4 + Recharts + Lucide).

> **Semua data di dashboard ini adalah SIMULASI.** Hardware, MQTT, dataset asli, dan model AI belum terintegrasi.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
cd vibeguard-dashboard
npm install
npm run dev
```

Buka alamat yang muncul (biasanya http://localhost:5173).

Build produksi: `npm run build`, lalu `npm run preview`.

## Struktur folder

```
src/
├── main.jsx, App.jsx, index.css   # entry, routing halaman, tema
├── config/navigation.js           # daftar menu sidebar
├── hooks/useHashRoute.js          # router sederhana (#/overview), tanpa dependency
├── context/AppContext.jsx         # state global: simulasi, alert, riwayat, perangkat
├── services/
│   ├── dataSource.js              # SATU-SATUNYA pintu data untuk UI (ganti di sini saat integrasi API/MQTT)
│   └── schema.js                  # kontrak bentuk data (TelemetryPacket, Alert, TestSession, ModelEvaluation)
├── simulation/                    # ← semua data dummy ada di sini
│   ├── vibrationSimulator.js      # sinyal getaran sintetis: normal / unbalance / loose
│   ├── heuristicScore.js          # skor anomali heuristik (placeholder, BUKAN model AI)
│   └── mockData.js                # alert awal, riwayat sesi, daftar perangkat
├── content/aiModels.js            # teks rancangan 3 pendekatan AI + protokol eksperimen
├── utils/                         # signal.js (RMS, crest factor), format.js, status.js, random.js
├── components/
│   ├── layout/                    # AppLayout, Sidebar, Topbar
│   ├── ui/                        # Card, StatCard, Badge, Button, Modal, Select, ScoreBar, dst.
│   ├── charts/                    # TimeSeriesChart reusable + tema warna grafik
│   └── alerts/                    # AlertList, AlertDetailModal
└── pages/                         # Overview, LiveMonitoring, AIAnalysis, AlertCenter, History, DeviceManagement
```

## Alur data

```
simulation/*  →  services/dataSource.js  →  context/AppContext.jsx  →  pages/*
```

Komponen UI tidak mengimpor data dummy secara langsung. Saat hardware siap, cukup ubah
`services/dataSource.js` (misalnya MQTT over WebSocket atau REST API) dengan bentuk data yang sama
seperti di `services/schema.js`.

## Catatan kejujuran data

- **Skor anomali** = aturan heuristik (rasio RMS terhadap baseline normal + crest factor), bukan output Isolation Forest atau ESN.
- **Jenis anomali** di alert diambil dari skenario simulasi yang dipilih, bukan hasil klasifikasi.
- **Metrik evaluasi** AI bernilai `null` dan tampil sebagai "Not Tested" sampai ada eksperimen asli.
