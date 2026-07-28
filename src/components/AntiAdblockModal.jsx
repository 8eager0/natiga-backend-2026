import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertOctagon, X } from 'lucide-react';
import { useAds } from './AdsContext';

export default function AntiAdblockModal() {
  const { adsEnabled } = useAds();
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!adsEnabled) {
      setIsAdBlockerActive(false);
      return;
    }
    const detectAdBlocker = async () => {
      let isBlocked = false;

      // Test 1: Try to fetch official Adsterra script URL
      try {
        const testUrl = 'https://www.highperformanceformat.com/73b413bfa62a149527b4f12554f5b827/invoke.js';
        await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      } catch (err) {
        // Network error usually indicates AdBlock extension blocked the domain
        isBlocked = true;
      }

      // Test 2: Create a decoy element with ad-specific class names
      if (!isBlocked) {
        const decoy = document.createElement('div');
        decoy.className = 'ad-zone ad-space banner-ad textads';
        decoy.style.position = 'absolute';
        decoy.style.top = '-9999px';
        decoy.style.left = '-9999px';
        decoy.style.height = '1px';
        decoy.style.width = '1px';
        document.body.appendChild(decoy);

        // Check if decoy element was hidden or zeroed by AdBlocker
        if (
          decoy.offsetHeight === 0 ||
          decoy.offsetWidth === 0 ||
          window.getComputedStyle(decoy).display === 'none' ||
          window.getComputedStyle(decoy).visibility === 'hidden'
        ) {
          isBlocked = true;
        }

        document.body.removeChild(decoy);
      }

      setIsAdBlockerActive(isBlocked);
    };

    detectAdBlocker();

    // Re-check periodically every 10 seconds
    const interval = setInterval(detectAdBlocker, 10000);
    return () => clearInterval(interval);
  }, [adsEnabled]);

  if (!adsEnabled || !isAdBlockerActive || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-fadeIn">
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-slate-950/50 text-right relative overflow-hidden text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 left-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="إغلاق التنبيه"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5 pl-6">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>تنبيه مانع الإعلانات</span>
            </div>
            <h3 className="text-sm font-extrabold text-white leading-snug">
              يرجى دعم الموقع بإيقاف مانع الإعلانات (AdBlock)
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              يقدم الموقع خدمة الاستعلام المجانية بفضل الإعلانات. يرجى إيقاف مانع الإعلانات لاستمرار الخدمة.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة التحديث</span>
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                متابعة التصفح
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

