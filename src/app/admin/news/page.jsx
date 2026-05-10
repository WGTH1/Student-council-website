'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';

import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminNews() {
  const { isAdmin, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', imageUrl: '', author: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  async function fetchNews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setNews(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) fetchNews();
  }, [isAdmin]);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('members') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('members')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isEditing) {
        const { error } = await supabase.from('news').update(formData).eq('id', isEditing);
        if (error) throw error;
        setIsEditing(null);
      } else {
        const { error } = await supabase.from('news').insert([formData]);
        if (error) throw error;
      }
      setFormData({ title: '', content: '', imageUrl: '', author: '' });
      fetchNews();
    } catch (err) {
      alert('Error saving news: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this article?')) {
      await supabase.from('news').delete().eq('id', id);
      fetchNews();
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logofutureplus.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-pink-500 transition-colors uppercase">FUTURE PLUS</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="px-4 py-1 bg-pink-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            News Management
          </div>
          <button 
            onClick={logout}
            className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 py-12">
        <div className="mb-12 flex justify-between items-center">
          <Link href="/admin" className="text-pink-500 font-black uppercase text-xs tracking-widest group">
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Admin
          </Link>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Announcements</h1>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-pink-500/10 mb-20 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl font-black mb-10 uppercase italic tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-pink-600 rounded-full"></span>
            {isEditing ? 'Edit Post' : 'Compose News'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-pink-500 outline-none transition-all text-white"
                  placeholder="News Heading"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Author</label>
                <input
                  type="text"
                  className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-pink-500 outline-none transition-all text-white"
                  placeholder="Admin Name"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({...prev, author: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Image Content</label>
              <div className="relative group/upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full p-10 bg-black border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center transition-all group-hover/upload:border-pink-500/50">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} className="h-32 rounded-xl border border-zinc-800 shadow-xl" />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">🖼️</span>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Upload News Banner</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-widest">Content</label>
              <textarea
                rows="8"
                className="w-full p-6 bg-black border border-zinc-800 rounded-[2rem] focus:border-pink-500 outline-none transition-all text-white resize-none font-medium leading-relaxed"
                placeholder="Write your announcement here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                required
              />
            </div>

            <div className="flex justify-end gap-6 pt-4">
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => { setIsEditing(null); setFormData({ title: '', content: '', imageUrl: '', author: '' }); }}
                  className="px-10 py-5 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                className="px-20 py-5 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-500 transition-all transform hover:scale-105 shadow-[0_10px_30px_rgba(219,39,119,0.3)] uppercase text-xs tracking-[0.2em]"
              >
                {isEditing ? 'Update News' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase italic tracking-widest text-zinc-500 px-4">Published History</h2>
          <div className="grid grid-cols-1 gap-6">
            {news.map((item) => (
              <div key={item.id} className="bg-zinc-900/20 p-8 rounded-[2.5rem] border border-zinc-800 flex items-center justify-between group hover:border-pink-500/30 transition-all">
                <div className="flex items-center gap-8 flex-1">
                   <div className="w-24 h-16 bg-zinc-800 rounded-2xl overflow-hidden shrink-0">
                     {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-black text-white group-hover:text-pink-500 transition-colors uppercase italic">{item.title}</h3>
                     <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">
                       {new Date(item.created_at).toLocaleDateString()} &bull; {item.author || 'ADMIN'}
                     </p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setIsEditing(item.id); setFormData({ title: item.title, content: item.content, imageUrl: item.imageUrl || '', author: item.author || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-4 bg-zinc-800 rounded-2xl hover:bg-pink-600 transition-all">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="p-4 bg-zinc-800 rounded-2xl hover:bg-red-600 transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
