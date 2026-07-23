import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertOctagon } from 'lucide-react';

export default function AntiAdblockModal() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);

  useEffect(() => {
    const detectAdBlocker = async () => {
      let isBlocked = false;

      // Test 1: Try to fetch official Google AdSense script URL
      try {
        const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const res = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      } catch (err) {
        // Network error usually indicates AdBlock extension blocked the domain
        isBlocked = true;
      }

      // Test 2: Create a decoy element with ad-specific class names
      if (!isBlocked) {
        const decoy = document.createElement('div');
        decoy.className = 'adsbygoogle ad-zone ad-space google-ad banner-ad textads';
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

    // Re-check periodically every 4 seconds
    const interval = setInterval(detectAdBlocker, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdBlockerActive) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 text-right animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-500/20 text-center space-y-5 relative overflow-hidden">
        
        {/* Background Red Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Warning Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>تم اكتشاف مانع الإعلانات (AdBlock)</span>
          </span>
          <h2 className="text-2xl font-black text-white leading-snug">
            يرجى إيقاف مانع الإعلانات لاستكمال الاستعلام عن النتيجة
          </h2>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed max-w-sm mx-auto">
          الموقع مجاني بالكامل ويستمر بتقديم الخدمة الفورية مجاناً بدعم الإعلانات. يرجى تعطيل مانع الإعلانات على متصفحك ثم إعادة تحديث الصفحة لمشاهدة النتيجة وحاسبة التنسيق.
        </p>

        {/* Action Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
          <span>قم بإيقاف مانع الإعلانات واضغط هنا لإعادة التحديث</span>
        </button>

        <p className="text-[11px] font-semibold text-slate-500">
          شكراً لتفهمك ودعمك لاستمرار الخدمة المجانية 🎓
        </p>
      </div>
    </div>
  );
}
