import React, { useEffect } from 'react';

/**
 * Adsterra Native Container Component
 * Renders container-bf09d6671c56c7cb443661c2f0a54842 native ad unit
 */
export default function AdsterraNativeContainer({ className = '' }) {
  useEffect(() => {
    const containerId = 'container-bf09d6671c56c7cb443661c2f0a54842';
    const scriptSrc = 'https://pl30488574.effectivecpmnetwork.com/bf09d6671c56c7cb443661c2f0a54842/invoke.js';

    // Check if script is already added
    let script = document.querySelector(`script[src="${scriptSrc}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">عروض رعاية خاصة</span>
      <div id="container-bf09d6671c56c7cb443661c2f0a54842" className="w-full max-w-2xl text-center min-h-[100px] overflow-hidden rounded-2xl"></div>
    </div>
  );
}
