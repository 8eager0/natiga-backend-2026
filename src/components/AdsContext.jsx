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

  // Ensure popunder and auto-redirect ad scripts are continuously cleaned up
  useEffect(() => {
    const cleanAdPopunders = () => {
      try {
        const adScripts = document.querySelectorAll(
          'script[src*="effectivecpmnetwork"]:not(iframe script), script[dataset-dynamic-ad="true"]'
        );
        adScripts.forEach(s => {
          try { s.remove(); } catch (e) {}
        });

        if (document.body) {
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.pointerEvents = '';
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
      } catch (error) {
        console.error('Safe ad cleanup caught error:', error);
      }
    };

    cleanAdPopunders();
    const interval = setInterval(cleanAdPopunders, 2000);
    return () => clearInterval(interval);
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
