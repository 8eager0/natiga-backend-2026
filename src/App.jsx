import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchSection from './components/SearchSection';
import StudentResultCard from './components/StudentResultCard';
import StatsDashboard from './components/StatsDashboard';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import AntiAdblockModal from './components/AntiAdblockModal';
import { API_BASE_URL } from './config';

// كشف مسار لوحة التحكم من URL
const isAdminRoute = () =>
  window.location.pathname === '/secure-admin-portal' ||
  window.location.hash === '#/secure-admin-portal' ||
  new URLSearchParams(window.location.search).has('admin');

export default function App() {
  const [isAdmin] = useState(isAdminRoute);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'privacy' });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync Dark Mode with DOM & localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Keep-Alive Ping to keep Render backend awake 24/7
  useEffect(() => {
    const pingBackend = () => {
      fetch(`${API_BASE_URL}/api/info`).catch(() => {});
    };
    pingBackend();
    const interval = setInterval(pingBackend, 3 * 60 * 1000); // Ping every 3 minutes
    return () => clearInterval(interval);
  }, []);



  if (isAdmin) {
    return <AdminDashboard />;
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSearch = () => {
    setSelectedStudent(null);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLegal = (tab = 'privacy') => {
    setLegalModal({ isOpen: true, tab });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-cairo">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1">
        {activeTab === 'search' && (
          <SearchSection onSelectStudent={handleSelectStudent} />
        )}
        {activeTab === 'result' && selectedStudent && (
          <StudentResultCard student={selectedStudent} onBack={handleBackToSearch} />
        )}
        {activeTab === 'stats' && <StatsDashboard />}
      </main>

      <Footer onOpenLegal={handleOpenLegal} />

      <LegalModal
        isOpen={legalModal.isOpen}
        initialTab={legalModal.tab}
        onClose={() => setLegalModal({ isOpen: false, tab: 'privacy' })}
      />

      <AntiAdblockModal />
    </div>
  );
}
