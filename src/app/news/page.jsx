'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/libs/auth-context';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setNews(data || []);
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-black uppercase tracking-widest hover:text-theme transition-all">
            Return Home
          </Link>
          {user && (
            <button 
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-500 hover:text-red-500 transition-all backdrop-blur-xl group"
              title="Logout"
            >
              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 py-16">
        <header className="mb-16 text-center lg:text-left">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">Latest Updates</h1>
          <p className="text-theme font-bold tracking-[0.3em] uppercase text-sm" style={{ color: settings.theme_color }}>ข่าวสารและประกาศจากพรรค {settings.party_name}</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-16 h-16 border-4 border-theme border-t-transparent rounded-full animate-spin" style={{ borderColor: settings.theme_color, borderTopColor: 'transparent' }}></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/10 rounded-[4rem] border border-dashed border-zinc-800">
            <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No announcements at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {news.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group relative flex flex-col bg-zinc-900/20 border border-zinc-800 rounded-[3rem] overflow-hidden hover:border-theme/50 transition-all duration-500">
                <div className="aspect-[16/9] overflow-hidden bg-zinc-800">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <img src={settings.logo_url} className="w-24 h-24" />
                    </div>
                  )}
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-theme text-[8px] font-black uppercase tracking-widest rounded-full text-white" style={{ backgroundColor: settings.theme_color }}>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Post by {item.author || 'Admin'}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-4 uppercase italic group-hover:text-theme transition-colors">{item.title}</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-8">{item.content}</p>
                  <div className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-theme" style={{ color: settings.theme_color }}>
                    Read Full Article <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {settings.party_name.toUpperCase()} PARTY.
        </p>
      </footer>
    </div>
  );
}
