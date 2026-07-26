import React, { useState, useEffect, useRef } from 'react';
import { useAds } from './AdsContext';

export default function AdsterraAd({ adKey, width, height, format = 'iframe', className = '' }) {
  const containerRef = useRef(null);
  const { adsEnabled } = useAds();
  const [inView, setInView] = useState(false);



  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // NOTE: Ad auto-refresh was removed.
  // Periodically re-rendering ad units via setRefreshKey every 35s
  // is against Adsterra's policy and can trigger click fraud detection.
  // Impressions should be counted naturally by the ad network itself.

  useEffect(() => {
    if (!adsEnabled || !inView) return;
    if (!adKey || !containerRef.current) return;

    const renderAd = () => {
      const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : '${format}',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
  </body>
</html>`;

      if (containerRef.current) {
        containerRef.current.innerHTML = `<iframe srcdoc="${htmlContent.replace(/"/g, '&quot;')}" width="${width}" height="${height}" style="border:none; overflow:hidden;" scrolling="no" sandbox="allow-scripts allow-same-origin"></iframe>`;
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(renderAd, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(renderAd, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [adKey, width, height, format, adsEnabled, inView]);

  if (!adsEnabled) return null;

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden min-h-[${height}px] ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">إعلان رعاية</span>
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full overflow-hidden" />
    </div>
  );
}
