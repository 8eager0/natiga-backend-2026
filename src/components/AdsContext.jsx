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
          setAdsEnabled(data.ads_enabled);
          window.ADS_ENABLED = data.ads_enabled;
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };

    checkSettings();
    const interval = setInterval(checkSettings, 5000); // Check every 5s for fast toggle
    return () => clearInterval(interval);
  }, []);

  // Dynamically load / remove Social Bar & Popunder scripts based on adsEnabled
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
      // Remove all dynamic ad scripts from DOM if ads are disabled
      scriptSources.forEach(src => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          existing.remove();
        }
      });
      // Remove any adsterra container overlays if created
      const adContainers = document.querySelectorAll('#container-bf09d6671c56c7cb443661c2f0a54842');
      adContainers.forEach(el => el.remove());
    }
  }, [adsEnabled]);

  return (
    <AdsContext.Provider value={{ adsEnabled }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => useContext(AdsContext);
