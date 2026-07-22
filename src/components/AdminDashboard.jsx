import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck, LogIn, LogOut, Upload, Trash2, RefreshCw, Download,
  Users, BarChart3, Settings, Activity, Eye, EyeOff, AlertTriangle,
  CheckCircle2, XCircle, Cpu, HardDrive, Clock, Database, Wifi,
  Filter, FileText, ToggleLeft, ToggleRight, Server, ChevronDown,
  Search, Menu, X
} from 'lucide-react';

const ADMIN_API = 'http://localhost:4000';

// ============================================================
// Utility: توليد رأس JWT للطلبات المصادق عليها
// ============================================================
const authHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-XSS-Protection': '1; mode=block'
});

// ============================================================
// Hook: إدارة الإشعارات (Toast Notifications)
// ============================================================
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, addToast };
};

// ============================================================
// Component: Toast Notification
// ============================================================
const ToastContainer = ({ toasts }) => (
  <div class="fixed top-4 left-4 z-[9999] space-y-2">
    {toasts.map(t => (
      <div key={t.id} class={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold text-white transition-all animate-slide-in min-w-[300px] ${
        t.type === 'success' ? 'bg-emerald-600' :
        t.type === 'error' ? 'bg-red-600' :
        t.type === 'warning' ? 'bg-amber-600' : 'bg-slate-700'
      }`}>
        {t.type === 'success' ? <CheckCircle2 class="w-4 h-4 shrink-0" /> :
         t.type === 'error' ? <XCircle class="w-4 h-4 shrink-0" /> :
         <AlertTriangle class="w-4 h-4 shrink-0" />}
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

// ============================================================
// Component: Login Page
// ============================================================
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${ADMIN_API}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم. تحقق من تشغيل Admin Server على المنفذ 4000.');
    }
    setLoading(false);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto rounded-3xl bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-4">
            <ShieldCheck class="w-11 h-11 text-white" />
          </div>
          <h1 class="text-2xl font-black text-white mb-1">لوحة التحكم</h1>

        </div>

        <div class="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          {error && (
            <div class="mb-5 flex items-center gap-3 bg-red-900/40 border border-red-800 text-red-300 text-sm font-bold p-4 rounded-2xl">
              <XCircle class="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} class="space-y-5">
            <div>
              <label class="block text-xs font-extrabold text-slate-400 mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                class="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label class="block text-xs font-extrabold text-slate-400 mb-2">كلمة المرور</label>
              <div class="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  class="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors pl-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff class="w-4 h-4" /> : <Eye class="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn class="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

// ============================================================
// Component: Stat Card
// ============================================================
const StatCard = ({ label, value, icon: Icon, color = 'emerald', sub }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-slate-400">{label}</span>
        <div class={`w-9 h-9 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon class="w-4.5 h-4.5" />
        </div>
      </div>
      <div class="text-2xl font-black text-white">{value}</div>
      {sub && <p class="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

// ============================================================
// Component: Progress Bar
// ============================================================
const ProgressBar = ({ percent, color = 'emerald' }) => {
  const colors = { emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500', amber: 'bg-amber-500' };
  const barColor = percent > 85 ? colors.red : percent > 60 ? colors.amber : colors[color];
  return (
    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div class={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
};

// ============================================================
// Main Admin Dashboard Component
// ============================================================
export default function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toasts, addToast } = useToast();

  // State for each section
  const [dashboard, setDashboard] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState({});
  const [filters, setFilters] = useState({ minPercentage: '', branch: '' });
  const [truncateCode, setTruncateCode] = useState('');
  const [showTruncateModal, setShowTruncateModal] = useState(false);
  const fileInputRef = useRef();

  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // ----------------------------------------------------------
  // Auth
  // ----------------------------------------------------------
  const handleLogin = (tok, user) => { setToken(tok); setAdminUser(user); };
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdminUser(null);
  };

  // ----------------------------------------------------------
  // Fetch Dashboard Overview
  // ----------------------------------------------------------
  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoad('dashboard', true);
    try {
      const res = await fetch(`${ADMIN_API}/admin/dashboard`, { headers: authHeaders(token) });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      const data = await res.json();
      setDashboard(data);
      setSettings(data.settings);
    } catch { addToast('تعذر تحميل بيانات لوحة التحكم.', 'error'); }
    setLoad('dashboard', false);
  }, [token]);

  // ----------------------------------------------------------
  // Fetch System Monitor
  // ----------------------------------------------------------
  const fetchMonitor = useCallback(async () => {
    if (!token) return;
    setLoad('monitor', true);
    try {
      const res = await fetch(`${ADMIN_API}/admin/monitor`, { headers: authHeaders(token) });
      const data = await res.json();
      setMonitor(data);
    } catch { addToast('تعذر تحميل بيانات المراقبة.', 'error'); }
    setLoad('monitor', false);
  }, [token]);

  // ----------------------------------------------------------
  // Fetch Leads
  // ----------------------------------------------------------
  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoad('leads', true);
    try {
      const params = new URLSearchParams();
      if (filters.minPercentage) params.set('minPercentage', filters.minPercentage);
      if (filters.branch) params.set('branch', filters.branch);
      const res = await fetch(`${ADMIN_API}/admin/leads?${params}`, { headers: authHeaders(token) });
      const data = await res.json();
      setLeads(data.data || []);
      setLeadsTotal(data.totalCount || 0);
    } catch { addToast('تعذر تحميل بيانات العملاء.', 'error'); }
    setLoad('leads', false);
  }, [token, filters]);

  useEffect(() => { if (token) { fetchDashboard(); fetchMonitor(); } }, [token]);
  useEffect(() => { if (token && activeTab === 'leads') fetchLeads(); }, [activeTab, token, filters]);
  useEffect(() => { if (token && activeTab === 'monitor') fetchMonitor(); }, [activeTab]);

  // ----------------------------------------------------------
  // Excel Upload Handler
  // ----------------------------------------------------------
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoad('upload', true);
    addToast(`جاري رفع الملف: ${file.name}...`, 'info');

    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      const res = await fetch(`${ADMIN_API}/admin/data/upload-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(data.message, 'success');
        fetchDashboard();
      } else {
        addToast(data.error || 'فشل رفع الملف.', 'error');
      }
    } catch { addToast('خطأ في الاتصال بالخادم.', 'error'); }
    setLoad('upload', false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ----------------------------------------------------------
  // Redis Cache Flush
  // ----------------------------------------------------------
  const handleFlushCache = async () => {
    setLoad('cache', true);
    try {
      const res = await fetch(`${ADMIN_API}/admin/cache/flush`, {
        method: 'POST', headers: authHeaders(token)
      });
      const data = await res.json();
      addToast(data.message || 'تم مسح الكاش!', 'success');
    } catch { addToast('خطأ في مسح الكاش.', 'error'); }
    setLoad('cache', false);
  };

  // ----------------------------------------------------------
  // Database Truncate
  // ----------------------------------------------------------
  const handleTruncate = async () => {
    setLoad('truncate', true);
    try {
      const res = await fetch(`${ADMIN_API}/admin/data/truncate`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ confirmationCode: truncateCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(data.message, 'success');
        setShowTruncateModal(false);
        setTruncateCode('');
        fetchDashboard();
      } else {
        addToast(data.message || data.error || 'رمز التأكيد غير صحيح.', 'error');
      }
    } catch { addToast('خطأ في الاتصال.', 'error'); }
    setLoad('truncate', false);
  };

  // ----------------------------------------------------------
  // Export CSV
  // ----------------------------------------------------------
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filters.minPercentage) params.set('minPercentage', filters.minPercentage);
    if (filters.branch) params.set('branch', filters.branch);
    const url = `${ADMIN_API}/admin/leads/export-csv?${params}&token=${token}`;
    const link = document.createElement('a');
    link.href = `${ADMIN_API}/admin/leads/export-csv?${params}`;
    link.setAttribute('download', `leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    fetch(`${ADMIN_API}/admin/leads/export-csv?${params}`, { headers: authHeaders(token) })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `leads_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
        addToast(`تم تصدير ${leadsTotal} سجل إلى CSV بنجاح!`, 'success');
      })
      .catch(() => addToast('خطأ في التصدير.', 'error'));
  };

  // ----------------------------------------------------------
  // Update Site Settings
  // ----------------------------------------------------------
  const handleSettingsUpdate = async (key, value) => {
    try {
      const res = await fetch(`${ADMIN_API}/admin/settings`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ [key]: value })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        addToast(`تم تحديث الإعداد "${key}" بنجاح.`, 'success');
      }
    } catch { addToast('خطأ في تحديث الإعدادات.', 'error'); }
  };

  // ----------------------------------------------------------
  // Render: Not logged in
  // ----------------------------------------------------------
  if (!token) return <LoginPage onLogin={handleLogin} />;

  // ----------------------------------------------------------
  // Sidebar nav items
  // ----------------------------------------------------------
  const navItems = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'data', label: 'إدارة البيانات', icon: Database },
    { id: 'leads', label: 'بيانات العملاء', icon: Users },
    { id: 'settings', label: 'إعدادات الموقع', icon: Settings },
    { id: 'monitor', label: 'مراقبة السيرفر', icon: Activity },
  ];

  return (
    <div class="min-h-screen bg-slate-950 text-white flex font-cairo" dir="rtl">
      <ToastContainer toasts={toasts} />

      {/* ==================== SIDEBAR ==================== */}
      <aside class={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0`}>
        {/* Logo */}
        <div class="p-5 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-sm font-black text-white">Admin Panel</h2>
              <p class="text-[10px] text-slate-400">نتيجة الثانوية 2026</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav class="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                class={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-right ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon class={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-black text-white">{adminUser?.username}</p>
              <p class="text-[10px] text-emerald-400">{adminUser?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              class="w-8 h-8 rounded-lg bg-red-900/40 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header class="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} class="text-slate-400 hover:text-white">
            {sidebarOpen ? <X class="w-5 h-5" /> : <Menu class="w-5 h-5" />}
          </button>
          <h1 class="text-sm font-black text-white">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div class="mr-auto flex items-center gap-2">
            <span class="text-[10px] px-2 py-1 bg-emerald-900/40 border border-emerald-800 text-emerald-400 rounded-lg font-bold">
              /secure-admin-portal
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main class="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ================== TAB: OVERVIEW ================== */}
          {activeTab === 'overview' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-black">نظرة عامة على النظام</h2>
                <button onClick={fetchDashboard} class="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors">
                  <RefreshCw class={`w-3.5 h-3.5 ${loading.dashboard ? 'animate-spin' : ''}`} />
                  تحديث
                </button>
              </div>

              {dashboard ? (
                <>
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="إجمالي الطلاب" value={dashboard.overview.totalStudents?.toLocaleString('ar')} icon={Users} color="blue" />
                    <StatCard label="نسبة النجاح" value={dashboard.overview.passRate} icon={CheckCircle2} color="emerald" sub={`ناجح: ${dashboard.overview.passCount?.toLocaleString('ar')}`} />
                    <StatCard label="إجمالي Leads" value={dashboard.overview.totalLeads?.toLocaleString('ar')} icon={FileText} color="purple" sub="عميل محتمل مسجل" />
                    <StatCard
                      label="حالة الموقع"
                      value={dashboard.overview.siteStatus === 'live' ? 'شغال' : 'صيانة'}
                      icon={Wifi}
                      color={dashboard.overview.siteStatus === 'live' ? 'emerald' : 'red'}
                      sub={`الإعلانات: ${dashboard.overview.adsEnabled ? 'مفعلة' : 'معطلة'}`}
                    />
                  </div>

                  {dashboard.recentLeads?.length > 0 && (
                    <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                      <h3 class="text-sm font-black text-white mb-4">آخر {dashboard.recentLeads.length} تسجيل</h3>
                      <div class="space-y-2">
                        {dashboard.recentLeads.map(lead => (
                          <div key={lead.id} class="flex items-center justify-between text-xs py-2 border-b border-slate-700/40 last:border-0">
                            <span class="font-bold text-slate-200">{lead.studentName}</span>
                            <span class="text-emerald-400 font-bold">{lead.percentage}%</span>
                            <span class="text-slate-500">{lead.phoneNumber}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div class="text-center py-12 text-slate-500">
                  <RefreshCw class="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p class="text-sm">جاري تحميل البيانات...</p>
                </div>
              )}
            </div>
          )}

          {/* ================== TAB: DATA MANAGEMENT ================== */}
          {activeTab === 'data' && (
            <div class="space-y-6">
              <h2 class="text-xl font-black">إدارة البيانات والملفات</h2>

              {/* Excel Upload */}
              <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Upload class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-sm font-black text-white">رفع ملف Excel جديد</h3>
                    <p class="text-xs text-slate-400">يستبدل البيانات الحالية بالكامل ويمسح Redis Cache تلقائياً</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  class="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  class={`flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all font-bold text-sm ${
                    loading.upload
                      ? 'border-blue-500 bg-blue-900/20 text-blue-300 animate-pulse'
                      : 'border-slate-600 hover:border-blue-500 hover:bg-blue-900/10 text-slate-300 hover:text-blue-300'
                  }`}
                >
                  {loading.upload ? (
                    <><span class="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" /> جاري رفع ومعالجة الملف...</>
                  ) : (
                    <><Upload class="w-5 h-5" /> انقر لاختيار ملف Excel (.xlsx) أو اسحبه هنا</>
                  )}
                </label>
              </div>

              {/* Cache & Truncate Controls */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Flush Redis */}
                <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <RefreshCw class="w-5 h-5" />
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-white">مسح ذاكرة Redis</h3>
                      <p class="text-xs text-slate-400">إعادة تحميل الكاش بعد تحديث البيانات</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFlushCache}
                    disabled={loading.cache}
                    class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {loading.cache ? <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw class="w-4 h-4" />}
                    مسح Redis Cache الآن
                  </button>
                </div>

                {/* Truncate Database */}
                <div class="bg-slate-800/40 border border-red-800/30 rounded-2xl p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                      <Trash2 class="w-5 h-5" />
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-white">حذف جميع البيانات</h3>
                      <p class="text-xs text-red-400">تحذير: لا يمكن التراجع عن هذه العملية!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTruncateModal(true)}
                    class="w-full py-2.5 rounded-xl bg-red-700/60 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-red-600/50 transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                    تفريغ قاعدة البيانات (Truncate)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB: LEADS ================== */}
          {activeTab === 'leads' && (
            <div class="space-y-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-xl font-black">بيانات العملاء (Leads) — {leadsTotal} سجل</h2>
                <button
                  onClick={handleExportCSV}
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-900/40"
                >
                  <Download class="w-4 h-4" />
                  تصدير CSV
                </button>
              </div>

              {/* Filters */}
              <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[160px]">
                  <label class="block text-[10px] font-extrabold text-slate-400 mb-1.5">الحد الأدنى للنسبة المئوية</label>
                  <input
                    type="number"
                    placeholder="مثال: 80"
                    value={filters.minPercentage}
                    onChange={e => setFilters(f => ({ ...f, minPercentage: e.target.value }))}
                    class="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500"
                    min="0" max="100"
                  />
                </div>
                <div class="flex-1 min-w-[160px]">
                  <label class="block text-[10px] font-extrabold text-slate-400 mb-1.5">الشعبة / الرغبة</label>
                  <input
                    type="text"
                    placeholder="مثال: طب"
                    value={filters.branch}
                    onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}
                    class="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={fetchLeads}
                  class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <Filter class="w-4 h-4" />
                  فلترة
                </button>
                <button
                  onClick={() => { setFilters({ minPercentage: '', branch: '' }); fetchLeads(); }}
                  class="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>

              {/* Leads Table */}
              <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {loading.leads ? (
                  <div class="py-12 text-center text-slate-500 text-sm">جاري التحميل...</div>
                ) : leads.length === 0 ? (
                  <div class="py-12 text-center text-slate-500 text-sm">
                    لا توجد بيانات تطابق الفلتر الحالي.
                  </div>
                ) : (
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-700 bg-slate-800/60">
                          {['#', 'الاسم', 'الهاتف', 'رقم الجلوس', 'المجموع', 'النسبة%', 'الشعبة', 'التاريخ'].map(h => (
                            <th key={h} class="text-right px-4 py-3 text-[11px] font-extrabold text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, idx) => (
                          <tr key={lead.id} class="border-b border-slate-700/40 hover:bg-slate-700/20 transition-colors">
                            <td class="px-4 py-3 text-slate-500 text-xs">{idx + 1}</td>
                            <td class="px-4 py-3 font-bold text-white">{lead.studentName}</td>
                            <td class="px-4 py-3 text-emerald-400 font-mono text-xs">{lead.phoneNumber}</td>
                            <td class="px-4 py-3 text-slate-300 text-xs font-mono">{lead.seatNumber}</td>
                            <td class="px-4 py-3 text-white font-bold">{lead.totalScore}/320</td>
                            <td class="px-4 py-3">
                              <span class={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                                lead.percentage >= 70 ? 'bg-emerald-900/40 text-emerald-400' :
                                lead.percentage >= 50 ? 'bg-amber-900/40 text-amber-400' : 'bg-red-900/40 text-red-400'
                              }`}>
                                {lead.percentage}%
                              </span>
                            </td>
                            <td class="px-4 py-3 text-slate-400 text-xs max-w-[180px] truncate">{lead.preferredBranch}</td>
                            <td class="px-4 py-3 text-slate-500 text-xs">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================== TAB: SETTINGS ================== */}
          {activeTab === 'settings' && (
            <div class="space-y-6">
              <h2 class="text-xl font-black">إعدادات الموقع الفورية</h2>

              {settings ? (
                <div class="space-y-4">
                  {/* Site Status Toggle */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 class="text-sm font-black text-white mb-1">حالة الموقع</h3>
                      <p class="text-xs text-slate-400">
                        الحالة الحالية: <span class={`font-bold ${settings.site_status === 'live' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {settings.site_status === 'live' ? 'شغال (Live)' : 'صيانة (Coming Soon)'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingsUpdate('site_status', settings.site_status === 'live' ? 'coming_soon' : 'live')}
                      class={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        settings.site_status === 'live'
                          ? 'bg-red-700/60 hover:bg-red-700 text-red-200 border border-red-600/50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {settings.site_status === 'live' ? (
                        <><ToggleRight class="w-4 h-4" /> إيقاف الموقع</>
                      ) : (
                        <><ToggleLeft class="w-4 h-4" /> تشغيل الموقع</>
                      )}
                    </button>
                  </div>

                  {/* Ads Toggle */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 class="text-sm font-black text-white mb-1">إعلانات Google AdSense</h3>
                      <p class="text-xs text-slate-400">
                        الحالة: <span class={`font-bold ${settings.ads_enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                          {settings.ads_enabled ? 'مفعلة' : 'معطلة'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingsUpdate('ads_enabled', !settings.ads_enabled)}
                      class={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        settings.ads_enabled
                          ? 'bg-red-700/60 hover:bg-red-700 text-red-200 border border-red-600/50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {settings.ads_enabled ? (
                        <><ToggleRight class="w-4 h-4" /> إيقاف الإعلانات</>
                      ) : (
                        <><ToggleLeft class="w-4 h-4" /> تفعيل الإعلانات</>
                      )}
                    </button>
                  </div>

                  {/* Maintenance Message */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                    <h3 class="text-sm font-black text-white mb-3">رسالة الصيانة</h3>
                    <div class="flex gap-3">
                      <input
                        type="text"
                        value={settings.maintenance_message || ''}
                        onChange={e => setSettings(s => ({ ...s, maintenance_message: e.target.value }))}
                        class="flex-1 bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-emerald-500"
                        placeholder="أدخل رسالة الصيانة..."
                      />
                      <button
                        onClick={() => handleSettingsUpdate('maintenance_message', settings.maintenance_message)}
                        class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>

                  {/* Last updated */}
                  <p class="text-xs text-slate-600 text-center">
                    آخر تحديث للإعدادات: {settings.updated_at ? new Date(settings.updated_at).toLocaleString('ar-EG') : 'غير محدد'}
                  </p>
                </div>
              ) : (
                <div class="text-center py-12 text-slate-500 text-sm">جاري تحميل الإعدادات...</div>
              )}
            </div>
          )}

          {/* ================== TAB: MONITOR ================== */}
          {activeTab === 'monitor' && (
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-black">مراقبة السيرفر اللحظية</h2>
                <button
                  onClick={fetchMonitor}
                  class="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <RefreshCw class={`w-3.5 h-3.5 ${loading.monitor ? 'animate-spin' : ''}`} />
                  تحديث الآن
                </button>
              </div>

              {monitor ? (
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CPU */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                    <div class="flex items-center gap-2">
                      <Cpu class="w-5 h-5 text-blue-400" />
                      <h3 class="font-black text-white text-sm">المعالج CPU</h3>
                    </div>
                    <div class="text-3xl font-black text-white">{monitor.cpu.usagePercent}%</div>
                    <ProgressBar percent={monitor.cpu.usagePercent} />
                    <div class="text-xs text-slate-400 space-y-1">
                      <p>النوع: <span class="text-slate-300 font-bold">{monitor.cpu.model}</span></p>
                      <p>الأنوية: <span class="text-slate-300 font-bold">{monitor.cpu.cores} cores</span></p>
                      <p>المعمارية: <span class="text-slate-300 font-bold">{monitor.cpu.architecture}</span></p>
                    </div>
                  </div>

                  {/* RAM */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                    <div class="flex items-center gap-2">
                      <HardDrive class="w-5 h-5 text-purple-400" />
                      <h3 class="font-black text-white text-sm">الذاكرة RAM</h3>
                    </div>
                    <div class="text-3xl font-black text-white">{monitor.memory.usagePercent}%</div>
                    <ProgressBar percent={monitor.memory.usagePercent} color="purple" />
                    <div class="text-xs text-slate-400 space-y-1">
                      <p>المستخدمة: <span class="text-purple-300 font-bold">{monitor.memory.used}</span></p>
                      <p>الحرة: <span class="text-emerald-300 font-bold">{monitor.memory.free}</span></p>
                      <p>الإجمالي: <span class="text-slate-300 font-bold">{monitor.memory.total}</span></p>
                    </div>
                  </div>

                  {/* System Info */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                    <div class="flex items-center gap-2">
                      <Server class="w-5 h-5 text-emerald-400" />
                      <h3 class="font-black text-white text-sm">معلومات السيرفر</h3>
                    </div>
                    <div class="text-xs text-slate-400 space-y-2">
                      {[
                        { label: 'النظام', value: monitor.system.platform },
                        { label: 'اسم الخادم', value: monitor.system.hostname },
                        { label: 'وقت التشغيل', value: monitor.system.uptime },
                        { label: 'Node.js', value: monitor.system.nodeVersion },
                        { label: 'رقم العملية PID', value: monitor.system.pid },
                      ].map(item => (
                        <div key={item.label} class="flex justify-between items-center py-1 border-b border-slate-700/40 last:border-0">
                          <span>{item.label}</span>
                          <span class="text-slate-200 font-bold text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Database & Redis */}
                  <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                    <div class="flex items-center gap-2">
                      <Database class="w-5 h-5 text-amber-400" />
                      <h3 class="font-black text-white text-sm">قاعدة البيانات والكاش</h3>
                    </div>
                    <div class="text-xs text-slate-400 space-y-2">
                      {[
                        { label: 'الطلاب المحملين', value: monitor.database.studentsLoaded?.toLocaleString('ar') },
                        { label: 'سجلات Leads', value: monitor.database.leadsCount?.toLocaleString('ar') },
                        { label: 'ملف JSON', value: monitor.database.dataFileExists ? '✅ موجود' : '❌ مفقود' },
                        { label: 'حالة Redis', value: monitor.redis.status },
                        { label: 'ذاكرة Redis', value: monitor.redis.memory },
                      ].map(item => (
                        <div key={item.label} class="flex justify-between items-center py-1 border-b border-slate-700/40 last:border-0">
                          <span>{item.label}</span>
                          <span class="text-slate-200 font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <p class="text-[10px] text-slate-600 text-left">{monitor.timestamp ? new Date(monitor.timestamp).toLocaleString('ar-EG') : ''}</p>
                  </div>
                </div>
              ) : (
                <div class="text-center py-12 text-slate-500 text-sm">
                  <RefreshCw class="w-8 h-8 animate-spin mx-auto mb-3" />
                  جاري تحميل بيانات المراقبة...
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================== TRUNCATE MODAL ==================== */}
      {showTruncateModal && (
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-red-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-red-900/40 border border-red-800 flex items-center justify-center mb-4">
                <AlertTriangle class="w-8 h-8 text-red-400" />
              </div>
              <h3 class="text-lg font-black text-white mb-2">تأكيد حذف جميع البيانات</h3>
              <p class="text-sm text-red-300 font-bold">
                ⚠️ هذه العملية ستحذف بيانات جميع الطلاب ({dashboard?.overview?.totalStudents?.toLocaleString('ar')} طالب) ولا يمكن التراجع عنها!
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-extrabold text-slate-400 mb-2">
                  اكتب رمز التأكيد: <span class="text-red-400 font-mono">TRUNCATE-NATIGA-2026</span>
                </label>
                <input
                  type="text"
                  value={truncateCode}
                  onChange={e => setTruncateCode(e.target.value)}
                  placeholder="TRUNCATE-NATIGA-2026"
                  class="w-full bg-slate-800 border border-red-800 text-white font-mono rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div class="flex gap-3">
                <button
                  onClick={() => { setShowTruncateModal(false); setTruncateCode(''); }}
                  class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleTruncate}
                  disabled={loading.truncate || truncateCode !== 'TRUNCATE-NATIGA-2026'}
                  class="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading.truncate ? (
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Trash2 class="w-4 h-4" /> تأكيد الحذف النهائي</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
