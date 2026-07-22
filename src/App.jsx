import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchSection from './components/SearchSection';
import StudentResultCard from './components/StudentResultCard';
import StatsDashboard from './components/StatsDashboard';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

// كشف مسار لوحة التحكم من URL
const isAdminRoute = () =>
  window.location.pathname === '/secure-admin-portal' ||
  window.location.hash === '#/secure-admin-portal' ||
  new URLSearchParams(window.location.search).has('admin');

export default function App() {
  const [isAdmin] = useState(isAdminRoute);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  // إذا كان المسار هو لوحة التحكم → عرض Admin Dashboard فقط
  if (isAdmin) {
    return <AdminDashboard />;
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSearch = () => {
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-cairo">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main class="flex-1">
        {activeTab === 'search' && (
          <SearchSection onSelectStudent={handleSelectStudent} />
        )}
        {activeTab === 'result' && selectedStudent && (
          <StudentResultCard student={selectedStudent} onBack={handleBackToSearch} />
        )}
        {activeTab === 'stats' && <StatsDashboard />}
      </main>

      <Footer />
    </div>
  );
}
