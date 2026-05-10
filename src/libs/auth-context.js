'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // ⚠️ แก้ไข ID เซิร์ฟเวอร์ของคุณที่นี่ (Discord Server ID / Guild ID)
  const TARGET_GUILD_ID = '1503008352383533066'; 

  useEffect(() => {
    // 1. ตรวจสอบ Session เริ่มต้น
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // 2. ฟังการเปลี่ยนแปลงการ Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth Event:', event);
      handleAuthChange(session, event === 'SIGNED_IN');
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthChange(session, isNewSignIn = false) {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // ดึงข้อมูล Admin จากฐานข้อมูล (Profiles Table)
      await syncAndFetchProfile(session, isNewSignIn);
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }

  async function syncAndFetchProfile(session, checkDiscord = false) {
    try {
      const user = session.user;

      // 1. ดึงโปรไฟล์ปัจจุบันจาก DB ก่อน
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // 2. ถ้าเป็น SIGNED_IN ใหม่ หรือยังไม่เป็น Admin ให้ลองเช็ค Discord ดูอีกรอบ
      if ((checkDiscord || !profile?.is_admin) && session.provider_token) {
        console.log('Verifying Discord membership for auto-admin...');
        
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${session.provider_token}` }
        });

        if (response.ok) {
          const guilds = await response.json();
          const isInServer = guilds.some(g => g.id === TARGET_GUILD_ID);

          if (isInServer) {
            console.log('Server Member Confirmed! Updating Admin Status...');
            // อัปเดตลงฐานข้อมูลให้ถาวร
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .upsert({ 
                id: user.id, 
                is_admin: true,
                full_name: user.user_metadata.full_name,
                avatar_url: user.user_metadata.avatar_url
              })
              .select()
              .single();
            
            profile = updatedProfile;
          }
        }
      }

      setIsAdmin(profile?.is_admin || false);
    } catch (err) {
      console.error('Profile Sync Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'identify guilds email', // ต้องมี guilds เพื่อเช็คเซิร์ฟเวอร์
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
