import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, PieChart, Sparkles, ExternalLink, GraduationCap, Award, Compass, Gift, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config';
import AdsterraAd from './AdsterraAd';
import AdsterraDirectLink from './AdsterraDirectLink';
import AdsterraNativeContainer from './AdsterraNativeContainer';
import ScoreTargetedAd from './ScoreTargetedAd';

const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/gf26fn1tk?key=8dddfc9479287281950cacc886d870c2';

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
      <div className="text-center py-20 text-slate-400 font-bold">
        <span className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p>جاري تحليلات وإحصائيات الـ 810 ألف طالب الحقيقية من الشيت...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* 1. Top Adsterra Banner (External Script) */}
      <div className="flex justify-center my-2">
        <div className="hidden md:block">
          <AdsterraAd adKey="9a45c769bb78d58a2940cdf3779cae7f" width={728} height={90} />
        </div>
        <div className="block md:hidden">
          <AdsterraAd adKey="73b413bfa62a149527b4f12554f5b827" width={320} height={50} />
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold mb-4">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>إحصائيات شيت الثانوية العامة الحقيقي 2025</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          تحليلات النسبة العامة وشريحة المجاميع الحقيقية
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          بيانات تحليلية دقيقة محسوبة مباشرة من شيت نتائج 2025 المرفوع ({stats.totalStudents.toLocaleString('ar-EG')} طالب).
        </p>
      </div>

      {/* 2. Native Unblockable Ad #1: Medical/Eng Scholarships Banner */}
      <ScoreTargetedAd percentage={90} branch="إحصائيات كليات القمة" />

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">نسبة النجاح العامة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.overallPassRate}
          </div>
          <p className="text-xs text-emerald-600 font-bold">محسوبة من إجمالي الشيت</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">إجمالي المتقدمين</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.totalStudents.toLocaleString('ar-EG')}
          </div>
          <p className="text-xs text-slate-500 font-medium">طالب وطالبة بالشيت</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">عدد الناجحين</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            {stats.passCount.toLocaleString('ar-EG')}
          </div>
          <p className="text-xs text-slate-500 font-medium">حاصلون على 50% فأكثر (160+)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">عدد الراسبين</span>
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400 mb-1">
            {stats.failCount.toLocaleString('ar-EG')}
          </div>
          <p className="text-xs text-slate-500 font-medium">أقل من 50% (أقل من 160)</p>
        </div>
      </div>

      {/* 3. Native Unblockable Ad #2: Special Direct Link Gift Offer Banner */}
      <AdsterraDirectLink />

      {/* 4. Banner Adsterra Placement (468x60 / 320x50) */}
      <div className="flex justify-center my-4">
        <div className="hidden sm:block">
          <AdsterraAd adKey="a019205f76a4a0315da7becc52188c93" width={468} height={60} />
        </div>
        <div className="block sm:hidden">
          <AdsterraAd adKey="73b413bfa62a149527b4f12554f5b827" width={320} height={50} />
        </div>
      </div>

      {/* Distribution of Scores Chart with Native & Script Ads interleaved */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>توزيع شرائح المجاميع التكرارية الحقيقية من 320 درجة</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">نسبة الطلاب الحاصلين على فئات المجاميع المختلفة بالشيت</p>
        </div>

        <div className="space-y-6">
          {(stats.buckets || []).map((bucket, idx) => (
            <React.Fragment key={idx}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{bucket.range}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{bucket.percent} ({bucket.count})</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${bucket.color} rounded-full transition-all duration-500`} 
                    style={{ width: bucket.percent }}
                  ></div>
                </div>
              </div>

              {/* Native & Script Ad Placements interleaved after every 2 buckets */}
              {idx === 1 && (
                <div className="my-4">
                  <a
                    href={DIRECT_LINK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg transition-all border border-purple-300/30 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Award className="w-6 h-6 animate-pulse text-yellow-300" />
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wide mb-1">
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>خصومات خاصة بالمتفوقين الحاصلين على +85%</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black leading-snug">
                          اضغط هنا للتقديم الفوري وتصفح الكليات الأهلية والخاصة المعتمدة بخصومات حصرية
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 group-hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-colors">
                      <span>عرض الخصومات</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              )}

              {idx === 3 && (
                <div className="py-4 border-y border-slate-100 dark:border-slate-800 flex justify-center">
                  <AdsterraAd adKey="1f517a72be5215de5a96e2a8439c8139" width={300} height={250} />
                </div>
              )}

              {idx === 5 && (
                <ScoreTargetedAd percentage={70} branch="تنسيق المرحلة الثانية والتكنولوجيا" />
              )}

              {idx === 7 && (
                <div className="my-4">
                  <a
                    href={DIRECT_LINK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg transition-all border border-emerald-300/30 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Compass className="w-6 h-6 animate-bounce text-emerald-200" />
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wide mb-1">
                          <Zap className="w-3 h-3 text-yellow-300" />
                          <span>فرص متميزة للطلاب المعاهد العالية 2026</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black leading-snug">
                          استكشف المعاهد العليا والكليات التكنولوجية المعتمة من وزارة التعليم العالي
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 group-hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-colors">
                      <span>عرض المعاهد المتاحة</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 5. Bottom Native Ad Banner */}
      <AdsterraDirectLink />

      {/* 6. High-Density Bottom Ad Grid & Native Container */}
      <div className="space-y-8 pt-4">
        
        {/* Dual 300x250 Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          <AdsterraAd adKey="1f517a72be5215de5a96e2a8439c8139" width={300} height={250} />
          <AdsterraAd adKey="1f517a72be5215de5a96e2a8439c8139" width={300} height={250} />
        </div>

        {/* Native Ad Unit */}
        <AdsterraNativeContainer />

        {/* Final Bottom Leaderboard Ad */}
        <div className="flex justify-center my-4">
          <div className="hidden md:block">
            <AdsterraAd adKey="9a45c769bb78d58a2940cdf3779cae7f" width={728} height={90} />
          </div>
          <div className="block md:hidden">
            <AdsterraAd adKey="73b413bfa62a149527b4f12554f5b827" width={320} height={50} />
          </div>
        </div>

      </div>

    </section>
  );
}
