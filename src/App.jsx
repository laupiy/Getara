import { useEffect, lazy, Suspense } from 'react';
import AppLayout from './components/layout/AppLayout';
import { NAV_ITEMS, DEFAULT_PAGE, HOME_PAGE } from './config/navigation';
import { useHashRoute } from './hooks/useHashRoute';
import Home from './pages/Home';
import Chatbot from './components/chatbot/Chatbot';

// Lazy-load setiap halaman dashboard untuk memangkas ukuran bundle awal
const Overview = lazy(() => import('./pages/Overview'));
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring'));
const AIAnalysis = lazy(() => import('./pages/AIAnalysis'));
const AlertCenter = lazy(() => import('./pages/AlertCenter'));
const History = lazy(() => import('./pages/History'));
const DeviceManagement = lazy(() => import('./pages/DeviceManagement'));

const PAGES = {
  overview: Overview,
  live: LiveMonitoring,
  ai: AIAnalysis,
  alerts: AlertCenter,
  history: History,
  devices: DeviceManagement,
};

const IDS = [HOME_PAGE, ...NAV_ITEMS.map((n) => n.id)];

export default function App() {
  const [route, navigate] = useHashRoute(IDS, DEFAULT_PAGE);

  // Setiap pindah halaman, mulai dari atas
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // Homepage tampil tanpa sidebar/topbar dashboard
  if (route === HOME_PAGE) {
    return (
      <>
        <Home onNavigate={navigate} />
        <Chatbot />
      </>
    );
  }

  const Page = PAGES[route];
  const meta = NAV_ITEMS.find((n) => n.id === route);

  return (
    <>
      <AppLayout current={route} page={meta} onNavigate={navigate}>
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center text-slate-400">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Memuat halaman...
              </div>
            </div>
          }
        >
          <Page onNavigate={navigate} />
        </Suspense>
      </AppLayout>
      <Chatbot />
    </>
  );
}
