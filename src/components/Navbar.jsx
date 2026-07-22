import React, { useState } from 'react';
import { Search, BarChart3, Moon, Sun, GraduationCap, Menu, X, ShieldCheck, Lock } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'search', label: 'الاستعلام عن النتيجة', icon: Search },
    { id: 'stats', label: 'إحصائيات المجاميع', icon: BarChart3 },
  ];

  const handleAdminLogin = () => {
    window.location.href = '?admin';
  };

  return (
    <header class="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-emerald-100 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Ministry Banner */}
      <div class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white text-xs py-1 px-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-medium">بوابة النتائج الرسمية - جمهورية مصر العربية</span>
          </div>
          <div class="hidden sm:flex items-center gap-4 text-emerald-100">
            <span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5" /> مأمنة بنسبة 100%</span>
            <span>|</span>
            <span>العام الدراسي 2025/2026</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div 
            class="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => setActiveTab('search')}
          >
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <GraduationCap class="w-7 h-7" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  نتيجة الثانوية العامة
                </h1>
                <span class="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-extrabold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  2026
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                وزارة التربية والتعليم والتعليم الفني
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav class="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  class={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon class={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Admin Login, Dark mode & Mobile Toggle */}
          <div class="flex items-center gap-2">
            
            {/* Admin Login Button */}
            <button
              onClick={handleAdminLogin}
              class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all shadow-sm"
              title="دخول لوحة تحكم الإدارة"
            >
              <Lock class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span class="hidden sm:inline">دخول الإدارة</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              class="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {darkMode ? <Sun class="w-5 h-5 text-amber-400" /> : <Moon class="w-5 h-5 text-slate-700" />}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                class={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon class="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={handleAdminLogin}
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          >
            <Lock class="w-5 h-5 text-emerald-600" />
            <span>تسجيل دخول الإدارة (Admin)</span>
          </button>
        </div>
      )}
    </header>
  );
}
