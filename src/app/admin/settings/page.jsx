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
  
  const [policies, setPolicies] = useState([]);
  const [policyFormData, setPolicyFormData] = useState({ title: '', description: '', icon: '📜' });
  const [isEditingPolicy, setIsEditingPolicy] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (settingsData) setSettings({
        ...settings,
        ...settingsData,
        show_email: settingsData.show_email ?? true,
        show_phone: settingsData.show_phone ?? true,
        show_line: settingsData.show_line ?? true,
        show_facebook: settingsData.show_facebook ?? true,
        show_instagram: settingsData.show_instagram ?? true,
        show_x: settingsData.show_x ?? true
      });

      // 2. Fetch Policies
      const { data: policyData } = await supabase
        .from('policies')
        .select('*')
        .order('id', { ascending: true });
      if (policyData) setPolicies(policyData);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) fetchData();
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
        .from('members')
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

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1);

      if (error) throw error;
      router.refresh();
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Policy Handlers
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingPolicy) {
        const { error } = await supabase.from('policies').update(policyFormData).eq('id', isEditingPolicy);
        if (error) throw error;
        setIsEditingPolicy(null);
      } else {
        const { error } = await supabase.from('policies').insert([policyFormData]);
        if (error) throw error;
      }
      setPolicyFormData({ title: '', description: '', icon: '📜' });
      fetchData(); // Refresh list
    } catch (err) {
      alert('Error saving policy: ' + err.message);
    }
  };

  const handlePolicyDelete = async (id) => {
    if (confirm('ยืนยันการลบนโยบายนี้?')) {
      await supabase.from('policies').delete().eq('id', id);
      fetchData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin" style={{ borderColor: settings.theme_color || '#db2777', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 selection:bg-theme/30">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors uppercase font-black italic tracking-tighter">
            ← Back
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

      <main className="max-w-4xl mx-auto p-6 py-16 space-y-24">
        
        {/* SECTION 1: BRANDING & CONTACT (SITE SETTINGS) */}
        <div className="space-y-12">
          <header>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Core Settings</h2>
            <p className="text-zinc-500 font-medium">จัดการข้อมูลพื้นฐานและการติดต่อสื่อสาร</p>
          </header>

          <form onSubmit={handleSaveSettings} className="space-y-12">
            {/* Branding */}
            <section className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
              <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Branding & Identity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Party Name</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white font-bold"
                    value={settings.party_name || ''}
                    onChange={(e) => setSettings(prev => ({...prev, party_name: e.target.value}))}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Theme Color</label>
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
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Official Logo</label>
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-black rounded-[2rem] border border-zinc-800">
                  <div className="w-32 h-32 bg-zinc-900 rounded-[2rem] flex items-center justify-center overflow-hidden border border-zinc-800">
                     <img src={settings.logo_url || '/logofutureplus.png'} className="w-20 h-20 object-contain" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Transparent PNG Recommended</p>
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

            {/* Visibility Settings */}
            <section className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
              <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                Contact Info & Visibility
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {[
                  { key: 'email', label: 'Email', icon: '📧' },
                  { key: 'phone', label: 'Phone', icon: '📞' },
                  { key: 'line', label: 'Line ID', icon: '🟢' },
                  { key: 'facebook', label: 'Facebook', icon: '🔵' },
                  { key: 'instagram', label: 'Instagram', icon: '🟣' },
                  { key: 'x', label: 'X (Twitter)', icon: '⚫' }
                ].map((item) => (
                  <div key={item.key} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                        {item.icon} {item.label}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-theme transition-colors">Visible</span>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-zinc-800 bg-black checked:bg-theme transition-all"
                          checked={settings[`show_${item.key}`]}
                          onChange={(e) => setSettings(prev => ({...prev, [`show_${item.key}`]: e.target.checked}))}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                      value={settings[`contact_${item.key}`] || ''}
                      onChange={(e) => setSettings(prev => ({...prev, [`contact_${item.key}`]: e.target.value}))}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="px-20 py-6 bg-theme text-white font-black rounded-[2rem] hover:opacity-90 transition-all transform hover:scale-105 shadow-xl uppercase text-xs tracking-[0.2em]"
                style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 30px ${settings.theme_color}44` }}
              >
                {saving ? 'Saving...' : 'Save Site Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="h-px bg-zinc-900 w-full"></div>

        {/* SECTION 2: POLICIES MANAGEMENT */}
        <div className="space-y-12">
          <header>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Campaign Policies</h2>
            <p className="text-zinc-500 font-medium">เพิ่มหรือแก้ไขนโยบายที่จะแสดงในหน้าแรก</p>
          </header>

          {/* Policy Form */}
          <div className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-theme/10 shadow-2xl" style={{ borderColor: `${settings.theme_color}22` }}>
            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-theme rounded-full" style={{ backgroundColor: settings.theme_color }}></span>
              {isEditingPolicy ? 'Edit Policy' : 'Add New Policy'}
            </h3>
            <form onSubmit={handlePolicySubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest text-center block">Icon</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-center text-2xl"
                    value={policyFormData.icon}
                    onChange={(e) => setPolicyFormData(prev => ({...prev, icon: e.target.value}))}
                    required
                  />
                </div>
                <div className="md:col-span-3 space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Policy Title</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white"
                    placeholder="หัวข้อนโยบาย..."
                    value={policyFormData.title}
                    onChange={(e) => setPolicyFormData(prev => ({...prev, title: e.target.value}))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Full Description</label>
                <textarea
                  rows="3"
                  className="w-full p-6 bg-black border border-zinc-800 rounded-[2rem] focus:border-theme outline-none transition-all text-white resize-none"
                  placeholder="รายละเอียดแบบเต็ม..."
                  value={policyFormData.description}
                  onChange={(e) => setPolicyFormData(prev => ({...prev, description: e.target.value}))}
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                {isEditingPolicy && (
                  <button type="button" onClick={() => { setIsEditingPolicy(null); setPolicyFormData({ title:'', description:'', icon:'📜' }); }} className="px-8 py-4 bg-zinc-800 rounded-2xl font-black uppercase text-xs">Cancel</button>
                )}
                <button type="submit" className="px-12 py-4 bg-theme text-white rounded-2xl font-black uppercase text-xs" style={{ backgroundColor: settings.theme_color }}>
                  {isEditingPolicy ? 'Update Policy' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>

          {/* Policy List */}
          <div className="grid grid-cols-1 gap-6">
            {policies.map((item) => (
              <div key={item.id} className="bg-zinc-900/20 p-8 rounded-[2.5rem] border border-zinc-800 flex items-center justify-between group hover:border-theme/30 transition-all">
                <div className="flex items-center gap-8 flex-1">
                   <div className="text-3xl p-4 bg-black rounded-2xl shrink-0">
                     {item.icon}
                   </div>
                   <div className="flex-1">
                     <h4 className="text-xl font-black text-white uppercase italic">{item.title}</h4>
                     <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{item.description}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setIsEditingPolicy(item.id); setPolicyFormData({ title: item.title, description: item.description, icon: item.icon || '📜' }); }} className="p-4 bg-zinc-800 rounded-2xl hover:text-theme transition-all">✏️</button>
                  <button onClick={() => handlePolicyDelete(item.id)} className="p-4 bg-zinc-800 rounded-2xl hover:text-red-500 transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
