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
      console.log('Checking profile for user:', user.email);

      // 1. ดึงโปรไฟล์ปัจจุบันจาก DB ก่อน
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.warn('Profile not found in DB, might need sync or creation:', fetchError.message);
      } else {
        console.log('Profile found! is_admin:', profile?.is_admin);
      }

      // 2. ถ้าเป็น SIGNED_IN ใหม่ หรือยังไม่เป็น Admin ให้ลองเช็ค Discord ดูอีกรอบ
      if ((checkDiscord || !profile?.is_admin) && session.provider_token) {
        console.log('Attempting Discord verification...');
...
            profile = updatedProfile;
            console.log('Admin status updated via Discord!');
          } else {
            console.log('User is not in the target Discord server.');
          }
        } else {
           console.error('Discord API call failed:', response.status);
        }
      }

      setIsAdmin(profile?.is_admin || false);
      console.log('Final Admin Status Set:', profile?.is_admin || false);
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
