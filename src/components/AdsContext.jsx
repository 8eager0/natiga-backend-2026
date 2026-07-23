import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AdsContext = createContext({ adsEnabled: true });

export const AdsProvider = ({ children }) => {
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/site-settings`);
        const data = await res.json();
        if (data && typeof data.ads_enabled === 'boolean') {
          setAdsEnabled(prev => {
            if (prev !== data.ads_enabled) {
              window.ADS_ENABLED = data.ads_enabled;
              return data.ads_enabled;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };

    checkSettings();
    const interval = setInterval(checkSettings, 2000);

    const handleCustomToggle = () => {
      if (typeof window.ADS_ENABLED === 'boolean') {
        setAdsEnabled(window.ADS_ENABLED);
      }
    };

    window.addEventListener('ads_toggle', handleCustomToggle);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ads_toggle', handleCustomToggle);
    };
  }, []);

  // Dynamically load / remove Social Bar & Popunder scripts & injected overlays based on adsEnabled
  useEffect(() => {
    const scriptSources = [
      'https://pl30487806.effectivecpmnetwork.com/23/e7/43/23e743489e8e4a7dddee815d3fabf6d5.js',
      'https://pl30487807.effectivecpmnetwork.com/cf/94/bc/cf94bcf11f7c049c87fd2612997d244f.js',
      'https://pl30488574.effectivecpmnetwork.com/bf09d6671c56c7cb443661c2f0a54842/invoke.js'
    ];

    if (adsEnabled) {
      // Inject scripts if not already in DOM
      scriptSources.forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
          const s = document.createElement('script');
          s.src = src;
          s.async = true;
          s.dataset.dynamicAd = 'true';
          document.body.appendChild(s);
        }
      });
    } else {
      // 1. Remove all dynamic ad scripts from DOM if ads are disabled
      const adScripts = document.querySelectorAll(
        'script[src*="effectivecpmnetwork"], script[src*="highperformanceformat"], script[dataset-dynamic-ad="true"]'
      );
      adScripts.forEach(s => s.remove());

      // 2. Remove ANY non-root elements injected directly into document.body (Adsterra full-screen black backdrops/masks)
      if (typeof document !== 'undefined' && document.body) {
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
          if (child.id !== 'root' && child.tagName !== 'SCRIPT') {
            child.remove();
          }
        });

        // 3. Reset any styles Adsterra mutated on body/html
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.pointerEvents = '';
        document.body.style.background = '';
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
          document.documentElement.style.position = '';
        }
      }
    }
  }, [adsEnabled]);

  return (
    <AdsContext.Provider value={{ adsEnabled }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => useContext(AdsContext);
