'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const departments = [
  { id: 'advisors', name: 'คณะที่ปรึกษา' },
  { id: 'admin', name: 'ฝ่ายบริหาร (สภา)' },
  { id: 'secretary', name: 'ฝ่ายเลขานุการ' },
  { id: 'academic', name: 'ฝ่ายวิชาการ' },
  { id: 'pr', name: 'ฝ่ายประชาสัมพันธ์' },
  { id: 'building', name: 'ฝ่ายอาคารและสถานที่' },
  { id: 'reception', name: 'ฝ่ายปฏิคม' },
  { id: 'audio-visual', name: 'ฝ่ายโสตทัศนศึกษา' },
  { id: 'activity', name: 'ฝ่ายกิจกรรมนักเรียน' },
  { id: 'inspector', name: 'ฝ่ายสารวัตร' },
  { id: 'treasurer', name: 'เหรัญญิก' },
];

export default function AdminPersonnelPage() {
  const { isAdmin, loading: authLoading, logout } = useAuth();
  const { settings } = useTheme();
  const router = useRouter();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', role: '', nickName: '', imageUrl: '', bio: '', department_id: 'admin',
    facebook: '', instagram: '', x: '', discord: ''
  });
  const [selectedRoleType, setSelectedRoleType] = useState('สมาชิก');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading, router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('department_id', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchMembers();
  }, [isAdmin, fetchMembers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('members').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('members').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === formData.department_id);
    const finalRole = selectedRoleType === 'ครูที่ปรึกษา' 
      ? `ครูที่ปรึกษา${dept.name.replace('ฝ่าย', '')}`
      : `${selectedRoleType}${dept.name.replace('ฝ่าย', '')}`;
      
    const dataToSave = { ...formData, role: finalRole };

    try {
      if (isEditing) {
        const { error } = await supabase.from('members').update(dataToSave).eq('id', isEditing);
        if (error) throw error;
        setIsEditing(null);
      } else {
        const { error } = await supabase.from('members').insert([dataToSave]);
        if (error) throw error;
      }
      setFormData({ 
        name: '', role: '', nickName: '', imageUrl: '', bio: '', department_id: 'admin',
        facebook: '', instagram: '', x: '', discord: ''
      });
      setSelectedRoleType('สมาชิก');
      fetchMembers();
      alert('บันทึกข้อมูลเรียบร้อย!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (member) => {
    setIsEditing(member.id);
    setFormData({ 
      name: member.name, 
      role: member.role, 
      nickName: member.nickName || '', 
      imageUrl: member.imageUrl || '', 
      bio: member.bio || '',
      department_id: member.department_id || 'admin',
      facebook: member.facebook || '',
      instagram: member.instagram || '',
      x: member.x || '',
      discord: member.discord || ''
    });
    
    if (member.role.includes('ครูที่ปรึกษา')) setSelectedRoleType('ครูที่ปรึกษา');
    else if (member.role.includes('ประธาน') || member.role.includes('หัวหน้า')) setSelectedRoleType('ประธาน');
    else if (member.role.includes('รอง')) setSelectedRoleType('รองประธาน');
    else if (member.role.includes('เลขานุการ')) setSelectedRoleType('เลขานุการ');
    else setSelectedRoleType('สมาชิก');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบสมาชิกคนนี้?')) {
      await supabase.from('members').delete().eq('id', id);
      fetchMembers();
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors">← Back</Link>
          <h1 className="font-black italic text-xl tracking-tighter uppercase">Personnel Manager</h1>
        </div>
        <button 
          onClick={logout}
          className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 py-12">
        {/* Form Section */}
        <div className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-theme/20 mb-20 shadow-2xl">
          <h2 className="text-2xl font-black mb-10 uppercase italic flex items-center gap-3">
            <span className="w-2 h-8 bg-theme rounded-full"></span>
            {isEditing ? 'Edit Personnel' : 'Add New Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Full Name</label>
                <input type="text" required className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-theme outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Nickname</label>
                <input type="text" className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-theme outline-none" value={formData.nickName} onChange={e => setFormData({...formData, nickName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Department</label>
                <select className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-theme outline-none" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Position</label>
              <div className="flex flex-wrap gap-2 p-1 bg-black border border-zinc-800 rounded-2xl">
                {['ครูที่ปรึกษา', 'ประธาน', 'รองประธาน', 'เลขานุการ', 'สมาชิก'].map((role) => (
                  <button key={role} type="button" onClick={() => setSelectedRoleType(role)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedRoleType === role ? 'bg-theme text-white' : 'text-zinc-600 hover:text-white'}`} style={selectedRoleType === role ? { backgroundColor: settings.theme_color } : {}}>{role}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Photo</label>
                <input type="file" onChange={handleFileUpload} className="w-full p-3 bg-black border border-zinc-800 rounded-2xl text-xs" />
               </div>
               <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Bio / Vision</label>
                <input type="text" className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-theme outline-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
               </div>
            </div>

            <div className="flex justify-end gap-4">
              {isEditing && <button type="button" onClick={() => { setIsEditing(null); setFormData({name:'', role:'', nickName:'', imageUrl:'', bio:'', department_id:'admin'}); }} className="px-8 py-4 bg-zinc-800 rounded-2xl font-black uppercase text-xs">Cancel</button>}
              <button type="submit" className="px-12 py-4 bg-theme text-white rounded-2xl font-black uppercase text-xs shadow-lg" style={{ backgroundColor: settings.theme_color }}>{isEditing ? 'Update Member' : 'Add Member'}</button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black uppercase italic">Current Personnel</h2>
            <input type="text" placeholder="Search name..." className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs outline-none focus:border-theme" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredMembers.map(member => (
              <div key={member.id} className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between group hover:border-theme/30 transition-all">
                <div className="flex items-center gap-6">
                  <img src={member.imageUrl || settings.logo_url} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div>
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <p className="text-[10px] font-black text-theme uppercase tracking-widest" style={{ color: settings.theme_color }}>{member.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(member)} className="p-3 bg-zinc-800 rounded-xl hover:bg-theme transition-all">✏️</button>
                  <button onClick={() => handleDelete(member.id)} className="p-3 bg-zinc-800 rounded-xl hover:bg-red-600 transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
