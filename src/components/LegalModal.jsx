import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Mail, Lock, Info, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn no-print">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">السياسات والمعلومات القانونية</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">موقع نتيجة الثانوية العامة 2026 الرسمي - natiga2026.com</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>سياسة الخصوصية (AdSense Compliant)</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>عن الموقع والشروط</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'contact'
                ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>اتصل بنا</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                سياسة الخصوصية واستخدام الإعلانات (Privacy Policy)
              </h4>
              <p>
                أهلاً بكم في موقع <strong>نتيجة الثانوية العامة 2026 (natiga2026.com)</strong>. نحن نولي أهمية قصوى لخصوصية زوارنا الكرام، وتوضح هذه الوثيقة أنواع المعلومات الشخصية التي نجمعها وكيفية استخدامها وحمايتها طبقاً لأعلى المعايير وقوانين Google AdSense الرسمية.
              </p>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">1. ملفات تعريف الارتباط (Cookies) وشبكة Google AdSense</h5>
              <p>
                يستعين موقعنا بشركات إعلانات كأطراف ثالثة (مثل Google AdSense) لعرض الإعلانات عند زيارتك للموقع. قد تستخدم هذه الشركات ملفات تعريف الارتباط (Cookies) وملفات تعريف الارتباط الخاصة بالإعلانات مثل (DART Cookie) لعرض الإعلانات بناءً على زياراتك السابقة لموقعنا أو للمواقع الأخرى على شبكة الإنترنت.
              </p>
              <ul className="list-disc pr-6 space-y-1 text-xs">
                <li>يمكن للمستخدمين إلغاء استخدام ملف تعريف الارتباط DART لزيارة سياسة الخصوصية الخاصة بإعلانات Google وشبكة المحتوى.</li>
                <li>يتم جمع معلومات مجهولة الهوية لتحسين تجربة المستخدم وعرض إعلانات ملائمة وتفاعلية.</li>
              </ul>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">2. ملفات السجل (Log Files)</h5>
              <p>
                مثل معظم خوادم المواقع الأخرى، يستخدم موقع natiga2026.com نظام ملفات السجل. يشمل ذلك عناوين بروتوكول الإنترنت (IP)، نوع المتصفح، مزود خدمة الإنترنت (ISP)، التاريخ والوقت، وعدد النقرات لتحليل الاتجاهات وإدارة الموقع. هذه البيانات غير مرتبطة بأي معلومات شخصية محددة.
              </p>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">3. حماية وجمع بيانات استعلام النتائج والتنسيق</h5>
              <p>
                إن بيانات الاستعلام برقم الجلوس أو الاسم تُستخدم فقط لغرض استدعاء بطاقة درجات الطالب وتوفير خدمة توقعات الكليات بشكل آمن وسريع دون تخزين ملفات تعريفية حساسة للزائر.
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                عن موقع نتيجة الثانوية العامة 2026
              </h4>
              <p>
                موقع <strong>natiga2026.com</strong> هو منصة إلكترونية تعليمية مستقلة متخصصة في تقديم خدمات الاستعلام المباشر والسريع عن نتائج الثانوية العامة المصرية لعام 2026، وتوفير أدوات الذكاء الاصطناعي لحساب النسبة المئوية وتوقعات التنسيق للكليات والمعاهد.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h5 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  رؤيتنا وهدفنا
                </h5>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  تسهيل وصول الطلاب وأولياء الأمور للنتائج المعتمدة بأقصى سرعة وبأعلى درجات الدقة بدون إعلانات مزعجة أو توقف للسيرفرات يوم إعلان النتيجة.
                </p>
              </div>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">شروط الاستخدام</h5>
              <ul className="list-disc pr-6 space-y-1 text-xs">
                <li>الخدمة مقدمة بشكل مجاني بالكامل لجميع الطلاب وأولياء الأمور.</li>
                <li>يتم استدعاء الدرجات من قاعدة البيانات الرسمية المعتمدة لاختبارات الثانوية العامة.</li>
                <li>توقعات التنسيق هي استرشادية مبنية على مجاميع الأعوام السابقة لتوجيه الطلاب.</li>
              </ul>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                الدعم الفني والتواصل
              </h4>
              <p>
                إذا كان لديك أي استفسار أو اقتراح أو طلب بخصوص سياسة الخصوصية أو خدمات الموقع، يسعدنا التواصل معك دائماً عبر الوسائل الرسمية:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">البريد الإلكتروني المباشر للدعم والاتصال</span>
                  <a href="mailto:8eager0@gmail.com" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline block">
                    8eager0@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">استفسارات الرعاية والتنسيق</span>
                  <a href="mailto:8eager0@gmail.com" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline block">
                    8eager0@gmail.com
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>natiga2026.com - جميع الحقوق محفوظة 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
