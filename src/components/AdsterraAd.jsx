import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Ad Unit Component
 * Uses srcdoc iframe isolation for 100% browser compatibility (Chrome, Safari, Mobile)
 */
export default function AdsterraAd({ adKey, width, height, format = 'iframe', className = '' }) {
  const containerRef = useRef(null);

  if (typeof window !== 'undefined' && window.ADS_ENABLED === false) return null;

  useEffect(() => {
    if (!adKey || !containerRef.current) return;

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

    containerRef.current.innerHTML = `<iframe srcdoc="${htmlContent.replace(/"/g, '&quot;')}" width="${width}" height="${height}" style="border:none; overflow:hidden;" scrolling="no"></iframe>`;
  }, [adKey, width, height, format]);

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden min-h-[${height}px] ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">إعلان رعاية</span>
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full overflow-hidden" />
    </div>
  );
}
