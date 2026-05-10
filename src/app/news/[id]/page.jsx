'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/libs/auth-context';

export default function NewsDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { settings } = useTheme();
  const { user, logout } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error) setArticle(data);
      setLoading(false);
    }
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin" style={{ borderColor: settings.theme_color, borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-black mb-4 uppercase italic">Article Not Found</h1>
        <Link href="/news" className="text-theme font-bold hover:underline">Back to News</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/news" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-black uppercase tracking-widest hover:text-theme transition-all">
            Back to News
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

      <main className="max-w-4xl mx-auto p-6 py-20">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1 bg-theme text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg text-white" style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 20px ${settings.theme_color}33` }}>Announcement</span>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{new Date(article.created_at).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-lg">✍️</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Author</p>
              <p className="text-sm font-bold text-white uppercase">{article.author || `${settings.party_name} Admin`}</p>
            </div>
          </div>
        </div>

        {article.imageUrl && (
          <div className="mb-16 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto" />
          </div>
        )}

        <div className="prose prose-invert prose-pink max-w-none">
          <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
            {article.content}
          </p>
        </div>

        <div className="mt-20 pt-12 border-t border-zinc-900 flex flex-col items-center text-center">
          <img src={settings.logo_url} className="w-16 h-16 mb-6 opacity-20 grayscale" />
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">{settings.party_name} Party Official Documentation</p>
        </div>
      </main>
    </div>
  );
}
