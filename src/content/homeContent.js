// Teks homepage. Dipisah dari komponen agar mudah diedit tanpa menyentuh layout.
import { Activity, AlertTriangle, Brain, Cpu, Gauge, Radio, Target, Wrench } from 'lucide-react';

// Link navbar homepage (scroll ke section). Ditambah seiring section baru dibuat.
export const HOME_NAV = [
  { id: 'about', label: 'Tentang' },
  { id: 'how-it-works', label: 'Cara Kerja' },
  { id: 'technology', label: 'Teknologi' },
  { id: 'explore', label: 'Jelajahi' },
];

export const HERO = {
  eyebrow: 'Prototype IoT + AI · Data masih simulasi',
  title: 'Getara',
  tagline: 'Smart Machine Health Monitoring System',
  description:
    'Sistem monitoring kondisi mesin melalui pola getaran. Sensor ADXL345 dan ESP32 membaca getaran motor, lalu data dianalisis untuk mendeteksi indikasi anomali sejak dini.',
  highlights: [
    { value: '3 sumbu', label: 'Getaran X, Y, Z (ADXL345)' },
    { value: 'Wi-Fi / MQTT', label: 'Pengiriman data dari ESP32' },
    { value: '3 pendekatan', label: 'AI yang akan dibandingkan' },
  ],
};

export const ABOUT = {
  eyebrow: 'Tentang Getara',
  title: 'Membaca kondisi mesin dari getarannya',
  description:
    'Perubahan pola getaran sering menjadi tanda awal adanya masalah pada mesin. Getara mengeksplorasi cara memantau pola tersebut secara otomatis, sehingga perubahan kondisi bisa dikenali lebih awal.',
  pillars: [
    {
      icon: AlertTriangle,
      title: 'Masalah',
      text: 'Gejala seperti getaran berlebih atau dudukan longgar sering baru diketahui lewat pemeriksaan manual, saat kondisi sudah memburuk.',
    },
    {
      icon: Target,
      title: 'Tujuan',
      text: 'Membangun prototype yang mampu mengenali perubahan pola getaran dan memberi peringatan dini ketika muncul indikasi anomali.',
    },
    {
      icon: Activity,
      title: 'Fungsi sistem',
      text: 'Membaca getaran 3 sumbu, mengirim data ke laptop, menganalisis polanya dengan AI, dan menampilkan hasilnya di dashboard.',
    },
  ],
  symptomsTitle: 'Contoh perubahan yang ingin dikenali',
  symptoms: [
    'Getaran lebih besar dari biasanya',
    'Putaran motor tidak stabil',
    'Ketidakseimbangan (unbalance) pada bagian berputar',
    'Dudukan motor mengalami kelonggaran',
  ],
  scope: [
    { icon: Wrench, label: 'Objek uji', text: 'Motor DC 12V sebagai representasi mesin skala kecil.' },
    { icon: Gauge, label: 'Fokus awal', text: 'Deteksi anomali, belum diagnosis jenis kerusakan secara spesifik.' },
    { icon: Cpu, label: 'Status', text: 'Prototype awal. Hardware, dataset asli, dan model AI belum terintegrasi.' },
  ],
};

// Komponen pada ilustrasi How It Works. `status` dibuat jujur sesuai kondisi project saat ini.
export const HOW_IT_WORKS = {
  eyebrow: 'Cara Kerja',
  title: 'Dari getaran motor hingga dashboard',
  description:
    'Arahkan kursor atau klik komponen untuk melihat perannya. Ilustrasi ini menggambarkan arsitektur prototype yang direncanakan.',
  components: [
    {
      id: 'motor',
      name: 'Motor DC 12V',
      role: 'Objek yang dipantau',
      detail: 'Diputar dengan PWM melalui driver motor. Diuji pada kondisi normal, unbalance, dan loose mounting.',
      status: 'Rencana uji',
    },
    {
      id: 'sensor',
      name: 'ADXL345',
      role: 'Membaca getaran 3 sumbu',
      detail: 'Accelerometer ±4 g dengan rencana laju 1.600 Hz, terhubung ke ESP32 melalui I2C.',
      status: 'Belum terintegrasi',
    },
    {
      id: 'esp32',
      name: 'ESP32',
      role: 'Mengumpulkan & mengirim data',
      detail: 'Membaca sensor, mengelompokkan sampel menjadi paket bernomor urut (seq), lalu mengirimnya lewat Wi-Fi.',
      status: 'Belum terintegrasi',
    },
    {
      id: 'mqtt',
      name: 'Wi-Fi / MQTT',
      role: 'Jalur komunikasi',
      detail: 'Paket dipublikasikan ke topik Getara/esp32-vg-01/vibration melalui broker MQTT (rencana: Mosquitto).',
      status: 'Belum terintegrasi',
    },
    {
      id: 'laptop',
      name: 'Laptop (Python)',
      role: 'Pemrosesan data & AI',
      detail: 'Menerima paket, menghitung fitur seperti RMS dan crest factor, lalu menjalankan model deteksi anomali.',
      status: 'Rencana',
    },
    {
      id: 'dashboard',
      name: 'Dashboard Getara',
      role: 'Visualisasi & peringatan',
      detail: 'Menampilkan grafik getaran, status mesin, dan alert. Saat ini berjalan dengan data simulasi.',
      status: 'Berjalan (simulasi)',
    },
  ],
};

export const TECHNOLOGY = {
  eyebrow: 'Teknologi',
  title: 'Tiga lapisan teknologi',
  description:
    'Getara menggabungkan perangkat IoT untuk membaca getaran, pemrosesan sinyal untuk mengubahnya menjadi fitur, dan AI untuk mengenali pola yang tidak biasa.',
  layers: [
    {
      icon: Radio,
      title: 'IoT & Sensor',
      text: 'Mengambil data getaran langsung dari motor dan mengirimkannya tanpa kabel.',
      items: [
        ['ADXL345', 'Accelerometer 3 sumbu, ±4 g'],
        ['ESP32', 'Mikrokontroler dengan Wi-Fi'],
        ['MQTT', 'Protokol pesan ringan untuk IoT'],
      ],
    },
    {
      icon: Activity,
      title: 'Pemrosesan Data',
      text: 'Sinyal mentah dibersihkan dan diringkas menjadi angka yang mudah dianalisis.',
      items: [
        ['Windowing', 'Memotong sinyal per beberapa detik'],
        ['RMS & crest factor', 'Mengukur energi dan impuls getaran'],
        ['FFT', 'Melihat komponen frekuensi (rencana)'],
      ],
    },
    {
      icon: Brain,
      title: 'Deteksi Anomali',
      text: 'Model belajar dari data normal, lalu menandai pola yang menyimpang.',
      items: [
        ['Unsupervised', 'Dilatih hanya dengan data normal'],
        ['Skor anomali', 'Nilai 0–1 dengan ambang peringatan'],
        ['Perbandingan', '3 pendekatan diuji pada data yang sama'],
      ],
    },
  ],
  aiTitle: 'Pendekatan AI yang akan dibandingkan',
  aiNote: 'Ketiganya masih tahap rancangan. Belum ada hasil eksperimen, sehingga belum ada klaim model mana yang lebih baik.',
};

export const EXPLORE = {
  eyebrow: 'Jelajahi Prototype',
  title: 'Coba dashboard monitoring',
  description:
    'Dashboard sudah bisa dicoba dengan data simulasi: ubah skenario motor, amati grafik getaran, dan lihat bagaimana alert muncul.',
  note: 'Preview ini memakai data simulasi yang sama dengan dashboard. Klik untuk membuka Overview.',
};