import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, Lock, FileText, Mail, Info } from 'lucide-react';

export default function Footer({ onOpenLegal }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Portal info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-white">بوابة نتيجة الثانوية العامة 2026</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              الموقع الرسمي المطور لخدمة الاستعلام الفوري والمجاني عن نتائج امتحانات الثانوية العامة بالجمهورية برقم الجلوس والاسم، مع توفير خدمات الاستعلام عن الأوائل وإحصائيات المجاميع وتصدير الشهادات الرسمية.
            </p>

            {/* Legal & AdSense Compliance Links */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
              <button
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-emerald-500/50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>سياسة الخصوصية (Privacy Policy)</span>
              </button>

              <button
                onClick={() => onOpenLegal && onOpenLegal('about')}
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-emerald-500/50"
              >
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>عن الموقع والشروط</span>
              </button>

              <button
                onClick={() => onOpenLegal && onOpenLegal('contact')}
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-emerald-500/50"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتصل بنا</span>
              </button>
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-extrabold text-white">روابط هامة للمستقبل</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://tansik.egypt.gov.eg" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>موقع تنسيق القبول بالجامعات</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://moe.gov.eg" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>موقع وزارة التربية والتعليم الرسمية</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://emis.gov.eg" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>مركز معلومات وزارة التربية والتعليم</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Support */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-extrabold text-white">الأمان والموثوقية</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>قاعدة بيانات مؤمنة ومشفرة</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                جميع البيانات المعروضة مراجعة ومحدثة طبقاً لاختبارات الدور الأول 2026.
              </p>
              
              {/* Direct Admin Portal Link */}
              <div className="pt-2">
                <a
                  href="?admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] transition-colors border border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right">
          <p>© 2026 جميع الحقوق محفوظة - وزارة التربية والتعليم والتعليم الفني - natiga2026.com</p>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="hover:text-slate-300">سياسة الخصوصية</button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('about')} className="hover:text-slate-300">عن الموقع</button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('contact')} className="hover:text-slate-300">اتصل بنا</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
