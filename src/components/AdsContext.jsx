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

  // Dynamically load / remove Social Bar & Popunder scripts & injected overlays safely
  useEffect(() => {
    try {
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
        // Safe Cleanup - wrapped in try/catch to ensure React NEVER crashes
        const adScripts = document.querySelectorAll(
          'script[src*="effectivecpmnetwork"], script[src*="highperformanceformat"], script[dataset-dynamic-ad="true"]'
        );
        adScripts.forEach(s => {
          try { s.remove(); } catch (e) {}
        });

        // Safely remove known adsterra container overlays
        const selectors = [
          '#container-bf09d6671c56c7cb443661c2f0a54842',
          '[id*="adsterra"]',
          '[class*="adsterra"]',
          'iframe[src*="effectivecpmnetwork"]',
          'iframe[src*="highperformanceformat"]'
        ];
        selectors.forEach(sel => {
          try {
            document.querySelectorAll(sel).forEach(el => el.remove());
          } catch (e) {}
        });

        // Safely reset body & html inline styles
        if (document.body) {
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.pointerEvents = '';
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
      }
    } catch (error) {
      console.error('Safe ad cleanup caught error:', error);
    }
  }, [adsEnabled]);

  return (
    <AdsContext.Provider value={{ adsEnabled }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdsContext);
  return context || { adsEnabled: true };
};
