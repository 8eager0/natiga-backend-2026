import React, { useState, useEffect } from 'react';
import { Crown, School, ArrowLeft } from 'lucide-react';

export default function TopStudents({ onSelectStudent }) {
  const [topList, setTopList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/top')
      .then(res => res.json())
      .then(data => {
        setTopList(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section class="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-bold mb-4">
          <Crown class="w-4 h-4 text-amber-500" />
          <span>لوحة شرف الأوائل للعام الدراسي 2025</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          أوائل شيت <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500">الثانوية العامة الحقيقي</span>
        </h2>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          الطلاب الأوائل الحاصلين على أعلى المجاميع الفعلية من شيت الـ Excel المرفوع (من 320 درجة).
        </p>
      </div>

      {loading ? (
        <div class="text-center py-12 text-slate-400 font-bold">
          <span class="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
          <p>جاري استخراج أوائل شيت الـ Excel...</p>
        </div>
      ) : topList.length === 0 ? (
        <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center max-w-md mx-auto">
          <p class="text-amber-800 dark:text-amber-300 font-bold">لا توجد بيانات طلاب بالشيت حالياً</p>
        </div>
      ) : (
        /* Top Spotlight Cards */
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topList.map((student) => {
            const isRank1 = student.rank === 1;
            const isRank2 = student.rank === 2;
            const isRank3 = student.rank === 3;

            return (
              <div
                key={student.seatNumber + student.name}
                onClick={() => onSelectStudent(student)}
                class={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all hover:scale-105 cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-xl ${
                  isRank1
                    ? 'border-amber-400 dark:border-amber-500/80 ring-2 ring-amber-400/30 md:-translate-y-3'
                    : (isRank2 ? 'border-slate-300 dark:border-slate-700' : 'border-amber-700/50')
                }`}
              >
                {/* Badge Rank Header */}
                <div class="flex items-center justify-between mb-4">
                  <div class={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg ${
                    isRank1
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/40'
                      : (isRank2 ? 'bg-slate-400 shadow-slate-400/40' : 'bg-amber-700 shadow-amber-700/40')
                  }`}>
                    {isRank1 ? '🥇' : (isRank2 ? '🥈' : (isRank3 ? '🥉' : `#${student.rank}`))}
                  </div>

                  <span class="text-xs font-black px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                    المركز {student.rank}
                  </span>
                </div>

                {/* Student Details */}
                <div class="space-y-3 mb-6">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {student.name}
                  </h3>
                  
                  <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <div class="flex items-center gap-1.5">
                      <School class="w-3.5 h-3.5 text-emerald-600" />
                      <span class="truncate">رقم الجلوس: {student.seatNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Percentage & Score */}
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{student.percentage}%</span>
                    <p class="text-xs font-bold text-slate-400">{student.totalScore} / 320 درجة</p>
                  </div>

                  <button class="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-3px] transition-transform">
                    <span>عرض النتيجة</span>
                    <ArrowLeft class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
