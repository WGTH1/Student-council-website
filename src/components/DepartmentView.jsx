'use client';

// VERSION: 1.1.1 - ADDED SECRETARY POSITION
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/libs/auth-context';

const departmentMap = {
  advisors: { name: 'คณะที่ปรึกษา', icon: '👨‍🏫' },
  admin: { name: 'ฝ่ายบริหาร (สภา)', icon: '👑' },
  secretary: { name: 'ฝ่ายเลขานุการ', icon: '📝' },
  academic: { name: 'ฝ่ายวิชาการ', icon: '📚' },
  pr: { name: 'ฝ่ายประชาสัมพันธ์', icon: '📢' },
  building: { name: 'ฝ่ายอาคารและสถานที่', icon: '🏢' },
  reception: { name: 'ฝ่ายปฏิคม', icon: '🤝' },
  'audio-visual': { name: 'ฝ่ายโสตทัศนศึกษา', icon: '🎤' },
  activity: { name: 'ฝ่ายกิจกรรมนักเรียน', icon: '🎉' },
  inspector: { name: 'ฝ่ายสารวัตร', icon: '👮' },
  treasurer: { name: 'เหรัญญิก', icon: '💰' },
};

export default function DepartmentView({ id, isAdmin }) {
  const dept = departmentMap[id];
  const { settings } = useTheme();
  const { logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', role: '', nickName: '', imageUrl: '', bio: '',
    facebook: '', instagram: '', x: '', discord: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedRoleType, setSelectedRoleType] = useState('สมาชิก');

  const fetchMembers = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('department_id', id);

      if (error) throw error;

      const sorted = (data || []).sort((a, b) => {
        const priority = (role) => {
          if (!role) return 5;
          if (role.includes('ครูที่ปรึกษา')) return 0;
          if (role.includes('ประธาน') || role.includes('หัวหน้า')) return 1;
          if (role.includes('รอง')) return 2;
          if (role.includes('เลขานุการ')) return 3;
          return 4;
        };
        return priority(a.role) - priority(b.role);
      });
      setMembers(sorted);
      setFilteredMembers(sorted);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    const filtered = members.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.nickName && member.nickName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('members')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('members')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

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
        const { error } = await supabase.from('members').insert([{ ...dataToSave, department_id: id }]);
        if (error) throw error;
      }
      setFormData({ 
        name: '', role: '', nickName: '', imageUrl: '', bio: '',
        facebook: '', instagram: '', x: '', discord: ''
      });
      setSelectedRoleType('สมาชิก');
      fetchMembers();
    } catch (err) {
      alert('Error saving member: ' + err.message);
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

  const handleDelete = async (memberId) => {
    if (isAdmin && confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) {
      try {
        const { error } = await supabase.from('members').delete().eq('id', memberId);
        if (error) throw error;
        fetchMembers();
      } catch (err) {
        alert('Error deleting member: ' + err.message);
      }
    }
  };

  if (!dept) return <div className="p-10 text-center text-white font-black uppercase tracking-widest">Division Not Found</div>;

  const topMember = filteredMembers[0];
  const otherMembers = filteredMembers.slice(1);

  return (
    <div className="min-h-screen bg-black text-white pb-24 selection:bg-pink-500/30">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
            {isAdmin ? 'ADMIN CONTROL' : 'VIEW ONLY MODE'}
          </div>
          {user && (
            <button 
              onClick={logout}
              className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 py-12">
        <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Link 
            href="/" 
            className="text-pink-500 hover:text-pink-400 transition-colors flex items-center gap-2 font-black uppercase text-xs tracking-widest group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Home
          </Link>
          <div className="flex items-center gap-6 text-right md:text-left">
            <span className="text-6xl" style={{ filter: `drop-shadow(0 0 20px ${settings.theme_color}66)` }}>{dept.icon}</span>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              {dept.name}
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme to-purple-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-50 transition duration-500" style={{ '--tw-gradient-from': settings.theme_color }}></div>
          <div className="relative flex items-center bg-black border border-zinc-800 rounded-[2rem] p-2 pr-6">
            <div className="pl-6 pr-4 text-zinc-600">🔍</div>
            <input 
              type="text" 
              placeholder="Search personnel by name, nickname, or position..."
              className="w-full bg-transparent p-4 outline-none text-white font-medium placeholder:text-zinc-700 italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[10px] font-black uppercase text-zinc-500 hover:text-theme transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-theme/10 mb-20 shadow-2xl relative overflow-hidden group" style={{ borderColor: `${settings.theme_color}22` }}>
            <h2 className="text-2xl font-black mb-10 text-white flex items-center gap-3 uppercase italic tracking-tight">
              <span className="w-2 h-8 bg-theme rounded-full"></span>
              {isEditing ? 'Modify Personnel' : 'Recruit New Member'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-blue-500 outline-none transition-all text-white placeholder:text-zinc-800"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Nickname</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-pink-500 outline-none transition-all text-white placeholder:text-zinc-800"
                    placeholder="JD"
                    value={formData.nickName}
                    onChange={(e) => setFormData(prev => ({...prev, nickName: e.target.value}))}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Select Position</label>
                  <div className="flex gap-2 p-1 bg-black border border-zinc-800 rounded-2xl h-[66px]">
                    {['ครูที่ปรึกษา', 'ประธาน', 'รองประธาน', 'เลขานุการ', 'สมาชิก'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRoleType(role)}
                        className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedRoleType === role 
                            ? 'bg-theme text-white shadow-lg' 
                            : 'text-zinc-600 hover:text-white'
                        }`}
                        style={selectedRoleType === role ? { backgroundColor: settings.theme_color } : {}}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Profile Image</label>
                  <div className="relative group/upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <div className="w-full p-8 bg-black border-2 border-dashed border-zinc-800 rounded-[1.5rem] flex flex-col items-center justify-center transition-all group-hover/upload:border-theme/50">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-theme border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[10px] font-black text-theme uppercase">Uploading...</span>
                        </div>
                      ) : formData.imageUrl ? (
                        <div className="flex items-center gap-4">
                          <img src={formData.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-zinc-800" />
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Image Loaded ✨</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">📸</span>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Drag & Drop or Click to Upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Personal Bio / Vision</label>
                  <textarea
                    rows="3"
                    className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-pink-500 outline-none transition-all text-white placeholder:text-zinc-800 resize-none"
                    placeholder="Describe your vision..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  />
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-6 pt-4 border-t border-zinc-800">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 ml-1 uppercase tracking-widest flex items-center gap-2">
                      <span>🔵</span> Facebook
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-pink-500 outline-none transition-all text-white text-xs"
                      placeholder="Username / URL"
                      value={formData.facebook}
                      onChange={(e) => setFormData(prev => ({...prev, facebook: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 ml-1 uppercase tracking-widest flex items-center gap-2">
                      <span>🟣</span> Instagram
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-pink-500 outline-none transition-all text-white text-xs"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({...prev, instagram: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 ml-1 uppercase tracking-widest flex items-center gap-2">
                      <span>⚫</span> X (Twitter)
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-pink-500 outline-none transition-all text-white text-xs"
                      placeholder="@username"
                      value={formData.x}
                      onChange={(e) => setFormData(prev => ({...prev, x: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 ml-1 uppercase tracking-widest flex items-center gap-2">
                      <span>🎨</span> Discord
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-pink-500 outline-none transition-all text-white text-xs"
                      placeholder="username#0000"
                      value={formData.discord}
                      onChange={(e) => setFormData(prev => ({...prev, discord: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => { 
                      setIsEditing(null); 
                      setFormData({ 
                        name: '', role: '', nickName: '', imageUrl: '', bio: '',
                        facebook: '', instagram: '', x: '', discord: ''
                      }); 
                      setSelectedRoleType('สมาชิก'); 
                    }}
                    className="px-10 py-5 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  className="px-16 py-5 bg-theme text-white font-black rounded-2xl hover:opacity-90 transition-all transform hover:scale-105 uppercase text-xs tracking-[0.2em]"
                  style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 30px ${settings.theme_color}44` }}
                >
                  {isEditing ? 'Apply Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pyramid Hierarchy */}
        <div className="space-y-20">
          <div className="flex flex-col items-center gap-4 mb-24">
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-theme to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${settings.theme_color}, transparent)` }}></div>
            <h2 className="text-2xl font-black text-white italic tracking-[0.5em] uppercase">Division Hierarchy</h2>
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-theme to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${settings.theme_color}, transparent)` }}></div>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-40">
               <div className="w-16 h-16 border-4 border-theme border-t-transparent rounded-full animate-spin shadow-theme" style={{ borderColor: settings.theme_color, borderTopColor: 'transparent' }}></div>
             </div>
          ) : members.length === 0 ? (
            <div className="text-center py-32 bg-zinc-900/10 rounded-[4rem] border border-dashed border-zinc-800">
              <p className="text-zinc-700 font-black uppercase tracking-[0.3em] text-sm italic">System Empty: No Data Found</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-32">
              {/* Leader Level */}
              {topMember && (
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-theme via-purple-600 to-theme rounded-[4rem] blur opacity-10 group-hover:opacity-40 transition duration-1000 animate-pulse" style={{ '--tw-gradient-from': settings.theme_color, '--tw-gradient-to': settings.theme_color }}></div>
                  
                  <Link href={`/member/${topMember.id}`} className="relative bg-zinc-950 p-12 rounded-[4rem] border border-zinc-800 w-96 flex flex-col items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-700 group-hover:border-theme/40 block cursor-pointer">
                    <div className="w-48 h-48 bg-zinc-900 rounded-[2.5rem] mb-10 overflow-hidden border-2 border-theme shadow-[0_0_40px_rgba(236,72,153,0.3)] transform transition-transform group-hover:scale-105 duration-700" style={{ borderColor: settings.theme_color, boxShadow: `0 0 40px ${settings.theme_color}44` }}>
                      {topMember.imageUrl ? (
                        <img 
                          src={topMember.imageUrl} 
                          alt={topMember.name} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                           <img src={settings.logo_url} className="w-20 h-20 opacity-10 grayscale" />
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-2 bg-theme text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-6 text-white shadow-[0_10px_20px_rgba(219,39,119,0.4)]" style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 20px ${settings.theme_color}66` }}>
                      {topMember.role}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">{topMember.name}</h3>
                    {topMember.nickName && <p className="text-theme font-black mb-6 italic text-lg tracking-wide" style={{ color: settings.theme_color }}>"{topMember.nickName}"</p>}
                    
                    <div className="mt-4 text-[10px] font-black text-theme/50 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: `${settings.theme_color}88` }}>
                      Click to View Profile
                    </div>
                  </Link>
                  
                  {isAdmin && (
                    <div className="absolute -top-6 -right-6 flex flex-col gap-3 z-20">
                      <button onClick={(e) => { e.preventDefault(); handleEdit(topMember); }} className="p-4 bg-zinc-900 rounded-3xl text-sm hover:bg-theme transition-all shadow-2xl" style={{ backgroundColor: settings.theme_color }}>✏️</button>
                      <button onClick={(e) => { e.preventDefault(); handleDelete(topMember.id); }} className="p-4 bg-zinc-900 rounded-3xl text-sm hover:bg-red-600 transition-all shadow-2xl">🗑️</button>
                    </div>
                  )}

                  {otherMembers.length > 0 && (
                    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-gradient-to-b from-theme via-theme/50 to-transparent" style={{ backgroundImage: `linear-gradient(to bottom, ${settings.theme_color}, ${settings.theme_color}88, transparent)` }}></div>
                  )}
                </div>
              )}

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 w-full max-w-7xl">
                {otherMembers.map((member) => (
                  <div key={member.id} className="relative group">
                    <Link href={`/member/${member.id}`} className="relative bg-zinc-900/20 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 hover:border-theme/50 transition-all duration-500 flex flex-col items-center text-center shadow-xl block cursor-pointer h-full">
                      <div className="w-32 h-32 bg-zinc-900 rounded-[2rem] mb-8 overflow-hidden border border-zinc-800 group-hover:border-theme/30 transition-all duration-700 group-hover:scale-110">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                             <img src={settings.logo_url} className="w-12 h-12 opacity-5 grayscale" />
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-1.5 bg-zinc-900 text-[9px] font-black tracking-[0.2em] uppercase rounded-full mb-4 text-theme border border-theme/20 group-hover:bg-theme group-hover:text-white transition-all" style={{ color: settings.theme_color, borderColor: `${settings.theme_color}33` }}>
                        {member.role}
                      </div>
                      <h4 className="text-2xl font-black text-white mb-2 group-hover:text-theme transition-colors uppercase italic tracking-tighter">
                        {member.name}
                      </h4>
                      {member.nickName && <p className="text-zinc-600 text-sm font-black italic mb-4 tracking-wider">({member.nickName})</p>}
                      
                      <div className="mt-2 text-[8px] font-black text-theme/40 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: `${settings.theme_color}66` }}>
                        View Details
                      </div>
                    </Link>
                    
                    {isAdmin && (
                      <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
                        <button onClick={(e) => { e.preventDefault(); handleEdit(member); }} className="text-xs p-3 bg-zinc-800 rounded-xl hover:text-theme transition-colors shadow-2xl" style={{ backgroundColor: settings.theme_color }}>✏️</button>
                        <button onClick={(e) => { e.preventDefault(); handleDelete(member.id); }} className="text-xs p-3 bg-zinc-800 rounded-xl hover:text-red-500 transition-colors shadow-2xl">🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
