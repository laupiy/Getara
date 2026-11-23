import { LayoutDashboard, Activity, Brain, Bell, History, Cpu } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard, desc: 'Ringkasan kondisi mesin' },
  { id: 'live', label: 'Pantauan Langsung', icon: Activity, desc: 'Getaran real-time (simulasi)' },
  { id: 'ai', label: 'Analisis AI', icon: Brain, desc: 'Rancangan & evaluasi model' },
  { id: 'alerts', label: 'Pusat Peringatan', icon: Bell, desc: 'Daftar peringatan' },
  { id: 'history', label: 'Riwayat', icon: History, desc: 'Riwayat sesi pengujian' },
  { id: 'devices', label: 'Manajemen Perangkat', icon: Cpu, desc: 'Perangkat & spesifikasi' },
];

// Halaman di luar dashboard (tanpa sidebar)
export const HOME_PAGE = 'home';
export const DASHBOARD_START = 'overview'; // tujuan tombol "Buka Dashboard"
export const DEFAULT_PAGE = HOME_PAGE; // dibuka saat URL tanpa hash (#/)
