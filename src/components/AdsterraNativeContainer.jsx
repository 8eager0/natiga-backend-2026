import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Native Container Component
 * Isolated inside srcdoc iframe to prevent document.write from wiping React DOM
 */
export default function AdsterraNativeContainer({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="container-bf09d6671c56c7cb443661c2f0a54842"></div>
    <script async="async" data-cfasync="false" src="https://pl30488574.effectivecpmnetwork.com/bf09d6671c56c7cb443661c2f0a54842/invoke.js"></script>
  </body>
</html>`;

    containerRef.current.innerHTML = `<iframe srcdoc="${htmlContent.replace(/"/g, '&quot;')}" width="100%" height="150" style="border:none; overflow:hidden;" scrolling="no"></iframe>`;
  }, []);

  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">عروض رعاية خاصة</span>
      <div ref={containerRef} className="w-full max-w-2xl text-center min-h-[120px] overflow-hidden rounded-2xl"></div>
    </div>
  );
}
