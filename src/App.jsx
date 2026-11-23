import { useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import { NAV_ITEMS, DEFAULT_PAGE, HOME_PAGE } from './config/navigation';
import { useHashRoute } from './hooks/useHashRoute';
import Home from './pages/Home';
import Overview from './pages/Overview';
import LiveMonitoring from './pages/LiveMonitoring';
import AIAnalysis from './pages/AIAnalysis';
import AlertCenter from './pages/AlertCenter';
import History from './pages/History';
import DeviceManagement from './pages/DeviceManagement';

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
  if (route === HOME_PAGE) return <Home onNavigate={navigate} />;

  const Page = PAGES[route];
  const meta = NAV_ITEMS.find((n) => n.id === route);

  return (
    <AppLayout current={route} page={meta} onNavigate={navigate}>
      <Page onNavigate={navigate} />
    </AppLayout>
  );
}