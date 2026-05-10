'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';
import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettings() {
  const { isAdmin, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    party_name: '',
    logo_url: '',
    theme_color: '#db2777',
    contact_email: '',
    contact_phone: '',
    contact_line: '',
    contact_facebook: '',
    contact_instagram: '',
    contact_x: '',
    show_email: true,
    show_phone: true,
    show_line: true,
    show_facebook: true,
    show_instagram: true,
    show_x: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (data) setSettings({
          ...settings,
          ...data,
          // Ensure booleans are handled correctly if they come as null from DB
          show_email: data.show_email ?? true,
          show_phone: data.show_phone ?? true,
          show_line: data.show_line ?? true,
          show_facebook: data.show_facebook ?? true,
          show_instagram: data.show_instagram ?? true,
          show_x: data.show_x ?? true
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) fetchSettings();
  }, [isAdmin]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('members') // Reusing existing bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('members')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1);

      if (error) throw error;
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว! ระบบกำลังอัปเดตข้อมูลทั่วทั้งเว็บไซต์');
    } catch (err) {
      alert('Error: ' + err.message + '\n\nNote: If you haven\'t added the new columns to Supabase yet, please run the SQL provided in the chat.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors">
            ← Back to Admin
          </Link>
          <div className="h-4 w-px bg-zinc-800"></div>
          <h1 className="font-black italic text-xl tracking-tighter uppercase">Site Configuration</h1>
        </div>
        <button 
          onClick={logout}
          className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-6 py-16">
        {/* Warning Section */}
        <div className="bg-red-900/20 border-2 border-red-500/50 p-8 rounded-[2rem] mb-12 flex items-start gap-6 animate-pulse">
          <span className="text-4xl">⚠️</span>
          <div>
            <h2 className="text-xl font-black uppercase italic mb-2 text-red-500">พื้นที่ควบคุมความปลอดภัยสูง (Critical Settings)</h2>
            <p className="text-red-200/70 text-sm font-medium leading-relaxed">
              การเปลี่ยนแปลงในหน้านี้จะส่งผลกระทบต่อชื่อพรรค, โลโก้ และการแสดงผลทั่วทั้งเว็บไซต์ 
              <span className="block mt-2 font-bold underline">ห้ามปรับเปลี่ยนเล่นโดยเด็ดขาดหากไม่มีความจำเป็น</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          {/* Branding Section */}
          <section className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black uppercase italic italic tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              Branding & Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Party Name</label>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white font-bold"
                  value={settings.party_name || ''}
                  onChange={(e) => setSettings(prev => ({...prev, party_name: e.target.value}))}
                  style={{ focusBorderColor: settings.theme_color }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Theme Main Color</label>
                <div className="flex gap-4">
                  <input
                    type="color"
                    className="w-20 h-[66px] bg-black border border-zinc-800 rounded-[1.5rem] p-2 cursor-pointer"
                    value={settings.theme_color || '#db2777'}
                    onChange={(e) => setSettings(prev => ({...prev, theme_color: e.target.value}))}
                  />
                  <input
                    type="text"
                    className="flex-1 p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white font-mono uppercase"
                    value={settings.theme_color || ''}
                    onChange={(e) => setSettings(prev => ({...prev, theme_color: e.target.value}))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Official Logo</label>
              <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-black rounded-[2rem] border border-zinc-800">
                <div className="w-32 h-32 bg-zinc-900 rounded-[2rem] flex items-center justify-center overflow-hidden border border-zinc-800">
                   <img src={settings.logo_url || '/logofutureplus.png'} className="w-20 h-20 object-contain" />
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <p className="text-zinc-500 text-xs font-medium">แนะนำใช้ไฟล์ PNG พื้นหลังโปร่งใส (Transparent)</p>
                  <div className="relative inline-block">
                    <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <button type="button" className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      {uploading ? 'Uploading...' : 'Upload New Logo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black uppercase italic italic tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-green-500 rounded-full"></span>
              Global Contact Info & Visibility
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Email */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Official Email</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_email}
                      onChange={(e) => setSettings(prev => ({...prev, show_email: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="email"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="contact@school.com"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_email: e.target.value}))}
                />
              </div>

              {/* Phone */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Hotline / Phone</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_phone}
                      onChange={(e) => setSettings(prev => ({...prev, show_phone: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="08x-xxx-xxxx"
                  value={settings.contact_phone || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_phone: e.target.value}))}
                />
              </div>

              {/* Line */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Line ID</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_line}
                      onChange={(e) => setSettings(prev => ({...prev, show_line: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="@yourline"
                  value={settings.contact_line || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_line: e.target.value}))}
                />
              </div>

              {/* Facebook */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Facebook Page</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_facebook}
                      onChange={(e) => setSettings(prev => ({...prev, show_facebook: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="Party Official Name"
                  value={settings.contact_facebook || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_facebook: e.target.value}))}
                />
              </div>

              {/* Instagram */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Instagram</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_instagram}
                      onChange={(e) => setSettings(prev => ({...prev, show_instagram: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="@username"
                  value={settings.contact_instagram || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_instagram: e.target.value}))}
                />
              </div>

              {/* X (Twitter) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">X (Twitter)</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                      checked={settings.show_x}
                      onChange={(e) => setSettings(prev => ({...prev, show_x: e.target.checked}))}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                  placeholder="@username"
                  value={settings.contact_x || ''}
                  onChange={(e) => setSettings(prev => ({...prev, contact_x: e.target.value}))}
                />
              </div>
            </div>
          </section>

          <div className="pt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-20 py-6 bg-theme text-white font-black rounded-[2rem] hover:opacity-90 transition-all transform hover:scale-105 shadow-lg uppercase text-sm tracking-[0.2em]"
              style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 30px ${settings.theme_color}44` }}
            >
              {saving ? 'Processing...' : 'Deploy Changes Site-wide'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
