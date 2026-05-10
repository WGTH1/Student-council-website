'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSuggestions();
    }
  }, [isAdmin]);

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อเสนอแนะนี้?')) {
      try {
        const { error } = await supabase
          .from('suggestions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchSuggestions();
      } catch (err) {
        alert('Error deleting suggestion: ' + err.message);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-pink-500 hover:text-white transition-colors">
            ← Back to Admin
          </Link>
          <div className="h-4 w-px bg-zinc-800"></div>
          <h1 className="font-black italic text-xl tracking-tighter uppercase">Digital Box Manager</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-4 py-1 bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(219,39,119,0.4)]">
            Admin View
          </div>
          <button 
            onClick={logout}
            className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 py-16">
        <header className="mb-16">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Student Feedback</h2>
          <p className="text-zinc-500 font-medium">รวบรวมข้อเสนอแนะและความคิดเห็นทั้งหมดจาก Digital Box</p>
        </header>

        {suggestions.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-zinc-900 border-dashed">
            <p className="text-zinc-700 font-black uppercase text-xs tracking-[0.3em]">No Suggestions Yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {suggestions.map((item) => (
              <div key={item.id} className="group relative bg-zinc-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-zinc-800 hover:border-pink-500/30 transition-all duration-500 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        item.type === 'Policy' ? 'bg-purple-600' :
                        item.type === 'Academic' ? 'bg-blue-600' :
                        item.type === 'Activity' ? 'bg-orange-600' :
                        item.type === 'Facility' ? 'bg-green-600' : 'bg-zinc-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        {new Date(item.created_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight uppercase">{item.title}</h3>
                    <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                      {item.content}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-4 bg-zinc-950 rounded-2xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
