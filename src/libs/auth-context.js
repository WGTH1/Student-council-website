'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // REPLACE THIS with your Discord Server ID (Guild ID)
  const TARGET_GUILD_ID = '1503008352383533066';

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) checkAdminStatus(session);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) checkAdminStatus(session);
      else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminStatus(session) {
    if (!session?.provider_token) {
      setLoading(false);
      return;
    }

    // NEW: Check if we already verified admin status in this session to avoid 429 errors
    const cachedAdminStatus = sessionStorage.getItem(`fp_admin_${session.user.id}`);
    if (cachedAdminStatus !== null) {
      setIsAdmin(cachedAdminStatus === 'true');
      setLoading(false);
      return;
    }

    try {
      // Fetch user's guilds from Discord API
      console.log('Verifying Discord membership...');
      const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Discord Rate Limit hit. Retrying with cache or defaulting to user.');
          setLoading(false);
          return;
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Discord API Error: ${response.status}`);
      }

      const guilds = await response.json();
      const isInServer = guilds.some(guild => guild.id === TARGET_GUILD_ID);

      // NEW: Cache the result
      setIsAdmin(isInServer);
      sessionStorage.setItem(`fp_admin_${session.user.id}`, isInServer ? 'true' : 'false');

    } catch (err) {
      console.error('Admin Check Failure:', err.message);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'identify guilds',
        redirectTo: window.location.origin
      }
    });
    if (error) alert('Login Error: ' + error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, loginWithDiscord, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
