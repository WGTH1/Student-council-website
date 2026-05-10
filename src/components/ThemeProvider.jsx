'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/libs/supabase';

const ThemeContext = createContext();

export function ThemeProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {
    party_name: 'Future Plus',
    logo_url: '/logofutureplus.png',
    theme_color: '#db2777',
  });
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    // Only fetch if initialSettings weren't provided or we need to sync
    async function fetchSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (data) {
          setSettings(data);
          document.documentElement.style.setProperty('--theme-primary', data.theme_color || '#db2777');
          document.documentElement.style.setProperty('--theme-primary-glow', `${data.theme_color || '#db2777'}44`);
        }
      } catch (err) {
        console.error('Error fetching theme settings:', err);
      } finally {
        setLoading(false);
      }
    }
    
    // We still fetch on client to ensure we have the latest if the admin just changed it
    // and to handle any hydration mismatches gracefully
    fetchSettings();
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, loading }}>
      <style jsx global>{`
        :root {
          --theme-primary: ${settings.theme_color || '#db2777'};
          --theme-primary-glow: ${settings.theme_color || '#db2777'}44;
        }
        .text-theme { color: var(--theme-primary); }
        .bg-theme { background-color: var(--theme-primary); }
        .border-theme { border-color: var(--theme-primary); }
        .selection\:bg-theme\/30::selection { background-color: var(--theme-primary-glow); }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // If we reach here, it means useTheme is being called outside of ThemeProvider
    // Or there's an import mismatch causing two different context objects
    return {
      settings: {
        party_name: 'Future Plus',
        logo_url: '/logofutureplus.png',
        theme_color: '#db2777',
      },
      loading: true
    };
  }
  return context;
};
