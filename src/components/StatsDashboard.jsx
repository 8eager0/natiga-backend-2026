import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, PieChart } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div class="text-center py-20 text-slate-400 font-bold">
        <span class="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p>جاري تحليلات وإحصائيات الـ 810 ألف طالب الحقيقية من الشيت...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <section class="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Page Title */}
      <div class="text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold mb-4">
          <BarChart3 class="w-4 h-4 text-emerald-600" />
          <span>إحصائيات شيت الثانوية العامة الحقيقي 2025</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          تحليلات النسبة العامة وشريحة المجاميع الحقيقية
        </h2>
        <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          بيانات تحليلية دقيقة محسوبة مباشرة من شيت نتائج 2025 المرفوع ({stats.totalStudents.toLocaleString('ar-EG')} طالب).
        </p>
      </div>

      {/* Top Summary KPI Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-slate-500">نسبة النجاح العامة</span>
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.overallPassRate}
          </div>
          <p class="text-xs text-emerald-600 font-bold">محسوبة من إجمالي الشيت</p>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-slate-500">إجمالي المتقدمين</span>
            <div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.totalStudents.toLocaleString('ar-EG')}
          </div>
          <p class="text-xs text-slate-500 font-medium">طالب وطالبة بالشيت</p>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-slate-500">عدد الناجحين</span>
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            {stats.passCount.toLocaleString('ar-EG')}
          </div>
          <p class="text-xs text-slate-500 font-medium">حاصلون على 50% فأكثر (160+)</p>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-slate-500">عدد الراسبين</span>
            <div class="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertCircle class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-black text-red-600 dark:text-red-400 mb-1">
            {stats.failCount.toLocaleString('ar-EG')}
          </div>
          <p class="text-xs text-slate-500 font-medium">أقل من 50% (أقل من 160)</p>
        </div>
      </div>

      {/* Distribution of Scores Chart */}
      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <PieChart class="w-5 h-5 text-emerald-600" />
            <span>توزيع شرائح المجاميع التكرارية الحقيقية من 320 درجة</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">نسبة الطلاب الحاصلين على فئات المجاميع المختلفة بالشيت</p>
        </div>

        <div class="space-y-4">
          {stats.buckets.map((bucket, idx) => (
            <div key={idx} class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold">
                <span class="text-slate-800 dark:text-slate-200">{bucket.range}</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">{bucket.percent} ({bucket.count})</span>
              </div>
              <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class={`h-full ${bucket.color} rounded-full transition-all duration-500`} 
                  style={{ width: bucket.percent }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
