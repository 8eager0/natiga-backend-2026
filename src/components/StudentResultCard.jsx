import React, { useEffect, useState } from 'react';
import { calculateStudentStats } from '../data/studentsData';
import { Printer, Share2, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, GraduationCap, Building2, BookOpen, User, Hash, Download, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import AdBanner from './AdBanner';
import LeadGenForm from './LeadGenForm';

export default function StudentResultCard({ student, onBack }) {
  const [isCapturing, setIsCapturing] = useState(false);

  if (!student) return null;

  const { totalScore, maxPossible, percentage } = calculateStudentStats(student);
  const isPassed = percentage >= 50;
  const statusText = isPassed ? 'ناجح' : 'راسب';

  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [student, isPassed]);

  const handlePrint = () => {
    window.print();
  };

  // Viral Image Capture & Download via html2canvas
  const handleDownloadImage = async () => {
    const element = document.getElementById('printable-certificate');
    if (!element) return;

    setIsCapturing(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution image output
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Append watermark canvas overlay
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = 'rgba(0, 104, 56, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('نتيجة الثانوية العامة 2026 - بوابة النتائج المعتمدة (Natiga2026.com)', canvas.width / 2, canvas.height - 30);
      }

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `نتيجة_${student.seatNumber}_${student.name}.png`;
      link.click();
      setIsCapturing(false);
    } catch (err) {
      console.error(err);
      setIsCapturing(false);
      alert('حدث خطأ أثناء التقاط الصورة.');
    }
  };

  const handleShare = () => {
    const text = `نتيجة الطالب: ${student.name}\nرقم الجلوس: ${student.seatNumber}\nالمجموع الكلي: ${totalScore} من ${maxPossible}\nالنسبة المئوية: ${percentage}%\nالحالة: ${statusText}\nرابط الاستعلام: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: `نتيجة الثانوية العامة - ${student.name}`,
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ تفاصيل النتيجة إلى الحافظة ومستعد للمشاركة على واتساب وفيسبوك!');
    }
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-8">
      
      {/* Top Banner Ad Placeholders */}
      <div class="no-print">
        <AdBanner slotId="top-result-slot" />
      </div>

      {/* Back Button & Top Actions */}
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <button
          onClick={onBack}
          class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
        >
          <ArrowRight class="w-4 h-4" />
          <span>العودة للبحث</span>
        </button>

        <div class="flex items-center gap-2">
          {/* Download PNG Screenshot button */}
          <button
            onClick={handleDownloadImage}
            disabled={isCapturing}
            class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
            title="تحميل صورة الكارت لمشاركتها ستوري"
          >
            <Camera class="w-4 h-4" />
            <span>{isCapturing ? 'جاري التقاط الصورة...' : 'تنزيل صورة للستوري'}</span>
          </button>

          <button
            onClick={handleShare}
            class="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Share2 class="w-4 h-4" />
            <span class="hidden sm:inline">مشاركة</span>
          </button>
          
          <button
            onClick={handlePrint}
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 transition-all"
          >
            <Printer class="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Main Official Printable Result Card */}
      <div 
        id="printable-certificate"
        class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden text-center"
      >
        {/* Background Watermark Pattern */}
        <div class="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] flex items-center justify-center">
          <GraduationCap class="w-[450px] h-[450px] text-emerald-900" />
        </div>

        {/* Certificate Header Banner */}
        <div class="border-b-2 border-dashed border-slate-200 dark:border-slate-800 pb-6 mb-8 relative">
          <div class="flex items-center justify-between mb-4">
            <div class="text-right">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400">جمهورية مصر العربية</p>
              <p class="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">وزارة التربية والتعليم والتعليم الفني</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck class="w-8 h-8" />
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400">قطاع التعليم العام</p>
              <p class="text-xs font-extrabold text-slate-700 dark:text-slate-300">امتحانات الدور الأول 2026</p>
            </div>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            بطاقة نتيجة شهادة الثانوية العامة
          </h2>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            العام الدراسي 2025 - 2026
          </p>
        </div>

        {/* Student Metadata Card */}
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 mb-8 text-right space-y-4">
          <div class="flex items-center gap-2">
            <User class="w-5 h-5 text-emerald-600" />
            <span class="text-sm font-bold text-slate-400">اسم الطالب:</span>
            <h3 class="text-xl font-black text-slate-900 dark:text-white">{student.name}</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <Hash class="w-4 h-4 text-emerald-600" />
              <span class="text-slate-500">رقم الجلوس:</span>
              <span class="font-black text-slate-900 dark:text-white text-base">{student.seatNumber}</span>
            </div>

            <div class="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <BookOpen class="w-4 h-4 text-emerald-600" />
              <span class="text-slate-500">الشعبة:</span>
              <span class="font-bold text-emerald-700 dark:text-emerald-300">{student.branch || 'عام'}</span>
            </div>
          </div>
        </div>

        {/* Big Highlights: Total Score, Percentage, Status ONLY */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          
          {/* Total Score Box */}
          <div class="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
            <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-2">الدرجة الإجمالية</span>
            <div class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalScore}
            </div>
            <span class="text-xs font-bold text-slate-400 mt-1">من إجمالي {maxPossible} درجة</span>
          </div>

          {/* Percentage Box */}
          <div class="bg-gradient-to-b from-emerald-50 to-emerald-100/60 dark:from-emerald-950/60 dark:to-emerald-900/40 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-md flex flex-col items-center justify-center sm:scale-105">
            <span class="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-2">النسبة المئوية</span>
            <div class="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {percentage}%
            </div>
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">النسبة العامة</span>
          </div>

          {/* Status Box (Pass / Fail) */}
          <div class={`p-6 rounded-3xl border shadow-sm flex flex-col items-center justify-center ${
            isPassed
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-emerald-600'
              : 'bg-gradient-to-b from-red-500 to-red-600 text-white border-red-600'
          }`}>
            <span class="text-xs font-extrabold text-white/80 mb-2">النتيجة والقبول</span>
            <div class="text-3xl font-black flex items-center gap-2">
              {isPassed ? <CheckCircle2 class="w-8 h-8" /> : <AlertTriangle class="w-8 h-8" />}
              <span>{statusText}</span>
            </div>
            <span class="text-xs font-bold text-white/90 mt-1">
              {isPassed ? 'مؤهل للتنسيق الجامعي' : 'غير مستوفٍ للحد الأدنى'}
            </span>
          </div>
        </div>

        {/* Footer Seal & Notes */}
        <div class="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p class="font-semibold text-right">نتيجة استرشادية معتمدة عبر بوابة النتائج المصرية الإلكترونية 2026.</p>
          <div class="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
            <ShieldCheck class="w-4 h-4" />
            <span>توثيق وزارة التربية والتعليم</span>
          </div>
        </div>
      </div>

      {/* Bottom Ad Banner Placeholder */}
      <div class="no-print">
        <AdBanner slotId="bottom-result-slot" />
      </div>

      {/* Lead Generation University Offer Form */}
      <div class="no-print">
        <LeadGenForm studentData={student} />
      </div>
    </div>
  );
}
