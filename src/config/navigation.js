import { LayoutDashboard, Activity, Brain, Bell, History, Cpu } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Ringkasan kondisi mesin' },
  { id: 'live', label: 'Live Monitoring', icon: Activity, desc: 'Getaran real-time (simulasi)' },
  { id: 'ai', label: 'AI Analysis', icon: Brain, desc: 'Rancangan & evaluasi model' },
  { id: 'alerts', label: 'Alert Center', icon: Bell, desc: 'Daftar peringatan' },
  { id: 'history', label: 'History', icon: History, desc: 'Riwayat sesi pengujian' },
  { id: 'devices', label: 'Device Management', icon: Cpu, desc: 'Perangkat & spesifikasi' },
];

// Halaman di luar dashboard (tanpa sidebar)
export const HOME_PAGE = 'home';
export const DASHBOARD_START = 'overview'; // tujuan tombol "Explore Dashboard"
export const DEFAULT_PAGE = HOME_PAGE; // dibuka saat URL tanpa hash (#/)
