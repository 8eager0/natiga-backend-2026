import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer class="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16 no-print">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Portal info */}
          <div class="space-y-3 md:col-span-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <GraduationCap class="w-5 h-5" />
              </div>
              <span class="text-base font-black text-white">بوابة نتيجة الثانوية العامة 2026</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed max-w-md">
              الموقع الرسمي المطور لخدمة الاستعلام الفوري والمجاني عن نتائج امتحانات الثانوية العامة بالجمهورية برقم الجلوس والاسم، مع توفير خدمات الاستعلام عن الأوائل وإحصائيات المجاميع وتصدير الشهادات الرسمية.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div class="space-y-2.5">
            <h4 class="text-sm font-extrabold text-white">روابط هامة للمستقبل</h4>
            <ul class="space-y-2">
              <li>
                <a href="https://tansik.egypt.gov.eg" target="_blank" rel="noreferrer" class="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>موقع تنسيق القبول بالجامعات</span>
                  <ExternalLink class="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://moe.gov.eg" target="_blank" rel="noreferrer" class="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>موقع وزارة التربية والتعليم الرسمية</span>
                  <ExternalLink class="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://emis.gov.eg" target="_blank" rel="noreferrer" class="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <span>مركز معلومات وزارة التربية والتعليم</span>
                  <ExternalLink class="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Support */}
          <div class="space-y-2.5">
            <h4 class="text-sm font-extrabold text-white">الأمان والموثوقية</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck class="w-4 h-4" />
                <span>قاعدة بيانات مؤمنة ومشفرة</span>
              </div>
              <p class="text-slate-500 text-[11px] leading-relaxed">
                جميع البيانات المعروضة مراجعة ومحدثة طبقاً لااختبارات الدور الأول 2026.
              </p>
              
              {/* Direct Admin Portal Link */}
              <div class="pt-2">
                <a
                  href="?admin"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] transition-colors border border-slate-700"
                >
                  <Lock class="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div class="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right">
          <p>© 2026 جميع الحقوق محفوظة - وزارة التربية والتعليم والتعليم الفني - جمهورية مصر العربية</p>
          <p class="flex items-center gap-1 text-slate-500">
            تم التطوير بواسطة أفضل معايير تجربة المستخدم وتطبيقات الويب الذكية
          </p>
        </div>
      </div>
    </footer>
  );
}
