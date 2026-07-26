import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAds } from './AdsContext';
import AdsterraAd from './AdsterraAd';

export default function StickyAnchorAd() {
  const { adsEnabled } = useAds();
  const [isVisible, setIsVisible] = useState(true);

  // Add padding to body so the sticky ad doesn't cover page content.
  // Without this, interactive elements near the bottom are hidden under
  // the ad and users accidentally click the ad instead of the real button.
  useEffect(() => {
    if (!adsEnabled || !isVisible) {
      document.body.style.paddingBottom = '';
      return;
    }
    // 320x50 mobile / 728x90 desktop
    const isMobile = window.innerWidth < 768;
    document.body.style.paddingBottom = isMobile ? '70px' : '110px';
    return () => { document.body.style.paddingBottom = ''; };
  }, [adsEnabled, isVisible]);

  if (!adsEnabled || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] flex flex-col items-center justify-center bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl py-1 px-2 transition-all animate-slideUp">
      {/* Dismiss / Close Button - min 44px touch target for mobile */}
      <div className="w-full max-w-4xl flex items-center justify-between px-2 mb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          إعلان رعاية معتمد
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="flex items-center gap-1 min-h-[44px] min-w-[44px] text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-700/60"
          title="إغلاق الإعلان"
          aria-label="إغلاق الإعلان"
        >
          <span>إغلاق</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive Anchor Banner: 728x90 Desktop, 320x50 Mobile */}
      <div className="hidden md:block">
        <AdsterraAd adKey="9a45c769bb78d58a2940cdf3779cae7f" width={728} height={90} className="my-0" />
      </div>
      <div className="block md:hidden">
        <AdsterraAd adKey="73b413bfa62a149527b4f12554f5b827" width={320} height={50} className="my-0" />
      </div>
    </div>
  );
}
