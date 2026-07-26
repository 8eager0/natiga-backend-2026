import React, { useState, useEffect, useRef } from 'react';
import { useAds } from './AdsContext';

export default function AdsterraAd({ adKey, width, height, format = 'iframe', className = '' }) {
  const containerRef = useRef(null);
  const { adsEnabled } = useAds();
  const [inView, setInView] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

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

  // Periodic ad refresh every 35s when visible to multiply impressions
  useEffect(() => {
    if (!adsEnabled || !inView) return;
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 35 * 1000);
    return () => clearInterval(interval);
  }, [adsEnabled, inView]);

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
        containerRef.current.innerHTML = `<iframe key="${refreshKey}" srcdoc="${htmlContent.replace(/"/g, '&quot;')}" width="${width}" height="${height}" style="border:none; overflow:hidden;" scrolling="no" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>`;
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(renderAd, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(renderAd, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [adKey, width, height, format, adsEnabled, inView, refreshKey]);

  if (!adsEnabled) return null;

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden min-h-[${height}px] ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">إعلان رعاية</span>
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full overflow-hidden" />
    </div>
  );
}
