import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Ad Unit Component
 * Safely renders Adsterra banner & iframe ad units in React without script conflicts
 */
export default function AdsterraAd({ adKey, width, height, format = 'iframe', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!adKey || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Create iframe to isolate global atOptions variable
    const iframe = document.createElement('iframe');
    iframe.width = `${width}px`;
    iframe.height = `${height}px`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';

    container.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
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
      </html>
    `);
    iframeDoc.close();
  }, [adKey, width, height, format]);

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden min-h-[${height}px] ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">إعلان رعاية</span>
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full overflow-hidden" />
    </div>
  );
}
