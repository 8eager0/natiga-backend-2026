import React, { useEffect } from 'react';
import { useAds } from './AdsContext';

export default function AdBanner({ slotId = '1234567890', format = 'auto', className = '' }) {
  const { adsEnabled } = useAds();
  if (!adsEnabled) return null;
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div class={`w-full my-6 text-center overflow-hidden min-h-[90px] ${className}`}>
      <div class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
        إعلان رعاية معتمد
      </div>

      {/* Real AdSense Ad Unit Container */}
      <ins
        class="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8012936811946791" // معرف ناشر AdSense الخاص بك: ca-pub-8012936811946791
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>

      {/* Visual Placeholder fallback for design and local demonstration */}
      <div class="bg-gradient-to-r from-emerald-50 via-slate-100 to-emerald-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 border border-emerald-200/80 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 text-right shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
            AD
          </div>
          <div>
            <h4 class="text-xs font-black text-slate-900 dark:text-white">خصومات تصل إلى 35% بالجامعات الخاصة والأهلية</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">احجز مقعدك الآن قبل اكتمال الأعداد بدفعات 2026</p>
          </div>
        </div>

        <button class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-colors whitespace-nowrap">
          تفاصيل العرض
        </button>
      </div>
    </div>
  );
}
