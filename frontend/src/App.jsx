import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import HomePage from './components/pages/HomePage';
import LiveMonitoringPage from './components/pages/LiveMonitoringPage';
import AqiPredictionPage from './components/pages/AqiPredictionPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import AboutProjectPage from './components/pages/AboutProjectPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Render current active page component
  const renderPageComponent = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={setActivePage} />;
      case 'monitoring':
        return <LiveMonitoringPage />;
      case 'prediction':
        return <AqiPredictionPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'about':
        return <AboutProjectPage />;
      default:
        return <HomePage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B1724] text-slate-100 antialiased font-sans selection:bg-[#0D9B76]/30 selection:text-white">
      {/* Desktop Left Sidebar (Fixed on Desktop) */}
      <div className="hidden lg:block h-screen sticky top-0 z-40">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </div>

      {/* Mobile Slide-over Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1724] border-r border-[#1B3554] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Dynamic Page Content with Framer Motion Transition */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {renderPageComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
