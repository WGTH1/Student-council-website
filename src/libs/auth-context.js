'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUserRef = typeof window !== 'undefined' ? { current: null } : null; // Simple ref-like tracking

  // ⚠️ แก้ไข ID เซิร์ฟเวอร์ของคุณที่นี่ (Discord Server ID / Guild ID)
  const TARGET_GUILD_ID = '1503008352383533066'; 

  useEffect(() => {
    // 1. ฟังการเปลี่ยนแปลงการ Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth Event:', event, session?.user?.id);
      
      if (!session) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // สำหรับ Mobile: บางครั้ง event อาจไม่ใช่ SIGNED_IN แต่เรามี session แล้ว
      // ให้ลองเช็คสิทธิ์เสมอถ้ามีการเปลี่ยนแปลงสถานะ
      handleAuthChange(session, event === 'SIGNED_IN' || event === 'INITIAL_SESSION');
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthChange(newSession, shouldCheckDiscord = false) {
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      // ดึงโปรไฟล์และเช็คสิทธิ์
      await syncAndFetchProfile(newSession, shouldCheckDiscord);
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }

  async function syncAndFetchProfile(session, shouldCheckDiscord = false) {
    try {
      const user = session.user;
      console.log('Syncing profile for:', user.email);

      // 1. ดึงโปรไฟล์ปัจจุบันจาก DB
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
      }

      // 2. ตรวจสอบกับ Discord:
      if (!profile?.is_admin) {
        if (session.provider_token) {
          console.log('Verifying server membership via Discord API...');
          
          const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${session.provider_token}` }
          });

          if (response.ok) {
            const guilds = await response.json();
            const isInServer = guilds.some(g => g.id === TARGET_GUILD_ID);

            if (isInServer) {
              console.log('User is in target server! Granting admin access...');
              
              // แก้ไข: ดึงชื่อจากหลายแหล่ง เพราะ iPhone/Discord Metadata อาจส่งมาต่างกัน
              const displayName = 
                user.user_metadata?.full_name || 
                user.user_metadata?.global_name || 
                user.user_metadata?.name || 
                user.user_metadata?.custom_claims?.global_name ||
                'Discord User';

              const { data: updatedProfile, error: upsertError } = await supabase
                .from('profiles')
                .upsert({ 
                  id: user.id, 
                  is_admin: true,
                  full_name: displayName,
                  avatar_url: user.user_metadata?.avatar_url || ''
                })
                .select()
                .single();
              
              if (upsertError) {
                console.error('Upsert Error:', upsertError);
              } else {
                profile = updatedProfile;
              }
            } else {
              console.log('User is NOT in the target Discord server.');
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Discord API Error:', response.status, errorData);
          }
        } else if (shouldCheckDiscord) {
          // ถ้าไม่มี provider_token ทั้งที่ควรจะมี (เช่น เพิ่งกด Login)
          // เป็นไปได้ว่าติดเรื่อง Privacy ใน iPhone
          console.warn('Missing provider_token. This often happens on iOS In-App Browsers.');
          // ไม่แสดง Alert พร่ำเพรื่อ แต่ Log ไว้เผื่อตรวจสอบ
        }
      }

      setIsAdmin(profile?.is_admin || false);
    } catch (err) {
      console.error('Auth sync error:', err);
    } finally {
      setLoading(false);
    }
  }

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'identify guilds email',
        redirectTo: window.location.origin
      }
    });
    if (error) alert('Login Error: ' + error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, loginWithDiscord, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
