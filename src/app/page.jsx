'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';

export const departments = [
  { id: 'advisors', name: 'คณะที่ปรึกษา', icon: '👨‍🏫', description: 'ครูที่ปรึกษาและผู้ให้คำแนะนำ' },
  { id: 'admin', name: 'ฝ่ายบริหาร (สภา)', icon: '👑', description: 'ประธาน และรองประธาน' },
  { id: 'academic', name: 'ฝ่ายวิชาการ', icon: '📚', description: 'จัดการด้านการเรียนและวิชาการ' },
  { id: 'pr', name: 'ฝ่ายประชาสัมพันธ์', icon: '📢', description: 'สื่อสารข้อมูลข่าวสารสู่ภายนอก' },
  { id: 'building', name: 'ฝ่ายอาคารและสถานที่', icon: '🏢', description: 'ดูแลความเรียบร้อยของสถานที่' },
  { id: 'reception', name: 'ฝ่ายปฏิคม', icon: '🤝', description: 'ต้อนรับและดูแลแขกผู้มาเยือน' },
  { id: 'audio-visual', name: 'ฝ่ายโสตทัศนศึกษา', icon: '🎤', description: 'ดูแลระบบเสียงและสื่อประสม' },
  { id: 'activity', name: 'ฝ่ายกิจกรรมนักเรียน', icon: '🎉', description: 'วางแผนและดำเนินกิจกรรมต่างๆ' },
  { id: 'inspector', name: 'ฝ่ายสารวัตร', icon: '👮', description: 'ดูแลระเบียบวินัยนักเรียน' },
  { id: 'treasurer', name: 'เหรัญญิก', icon: '💰', description: 'จัดการด้านการเงินและบัญชี' },
];

import { useAuth } from '@/libs/auth-context';
import { useTheme } from '../components/ThemeProvider';

export default function Home() {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const { settings, loading: themeLoading } = useTheme();
  const { user, isAdmin, loginWithDiscord, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchNews() {
      setNewsLoading(true);
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (newsData) setNews(newsData);
      setNewsLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Profile / Login Status */}
        <div className="absolute top-10 right-10 z-20">
          {user ? (
            <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-xl p-2 pr-6 rounded-full border border-zinc-800">
              <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full border border-theme" />
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Logged in as</p>
                <p className="text-xs font-bold text-white uppercase">{user.user_metadata.full_name}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={loginWithDiscord}
              className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-theme transition-all"
            >
              Sign In with Discord
            </button>
          )}
        </div>

        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-theme/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-theme/5 rounded-full blur-[120px] -z-10"></div>

        <div className="mb-8 relative group">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-black rounded-[2.5rem] p-1 flex items-center justify-center shadow-2xl border border-zinc-800 group-hover:border-theme/50 transition-all duration-500" style={{ boxShadow: `0 20px 50px ${settings.theme_color}22` }}>
            <img src={settings.logo_url} alt={`${settings.party_name} Logo`} className="w-full h-full object-contain rounded-[2.2rem]" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-black border-2 rounded-full flex items-center justify-center animate-bounce border-theme" style={{ boxShadow: `0 0 15px ${settings.theme_color}` }}>
            <span className="text-xl">🚀</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic">
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, white, ${settings.theme_color}, white)` }}>
            {settings.party_name}
          </span>
        </h1>
        
        <p className="max-w-xl text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
          ก้าวข้ามขีดจำกัด สร้างสรรค์อนาคตใหม่ <br />
          <span className="text-theme uppercase tracking-widest text-sm font-bold tracking-[0.2em]">Student Council Power</span>
        </p>

        <div className="flex flex-wrap justify-center gap-6">
            {authLoading ? (
               <div className="px-10 py-4 bg-zinc-900 rounded-2xl animate-pulse w-40"></div>
            ) : isAdmin && (
              <Link href="/admin" className="px-10 py-4 bg-theme text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl uppercase text-sm flex items-center gap-2" style={{ boxShadow: `0 10px 30px ${settings.theme_color}44` }}>
                <span>🛡️</span> Control Panel
              </Link>
            )}
            <Link href="/suggestions" className="px-10 py-4 bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl hover:border-theme hover:text-theme transition-all shadow-xl uppercase text-sm flex items-center gap-2 group">
              <span>📮</span> Digital Box 
              <span className="text-zinc-600 group-hover:text-theme transition-colors ml-1">→</span>
            </Link>
        </div>

        <div className="absolute bottom-10 animate-bounce text-theme/30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 2. NEWS SECTION */}
      <section id="news" className="py-32 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
            <div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Latest Updates</h2>
              <p className="text-theme font-bold tracking-[0.3em] uppercase text-xs">ข่าวสารล่าสุดจากพรรค {settings.party_name}</p>
            </div>
            <Link href="/news" className="text-zinc-500 font-black uppercase text-xs tracking-widest hover:text-theme transition-colors">
              View All News <span className="ml-2">→</span>
            </Link>
          </header>

          {newsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-theme border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 bg-black/40 rounded-[3rem] border border-zinc-900 border-dashed">
              <p className="text-zinc-700 font-black uppercase text-xs tracking-widest">No Recent Announcements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="group relative flex flex-col bg-black border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-theme/40 transition-all duration-500">
                  <div className="aspect-video overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center opacity-10">
                        <img src={settings.logo_url} className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <span className="text-[8px] font-black uppercase tracking-widest text-theme mb-2 block">{new Date(item.created_at).toLocaleDateString()}</span>
                    <h3 className="text-xl font-black uppercase italic text-white line-clamp-1 group-hover:text-theme transition-colors">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. DEPARTMENTS SECTION */}
      <section id="departments" className="py-32 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-20 text-center">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Personnel Directory</h2>
            <p className="text-theme font-bold tracking-[0.3em] uppercase text-xs italic">ทำเนียบสมาชิกพรรคแยกตามฝ่าย</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/user/department/${dept.id}`}
                className="group relative p-10 bg-zinc-900/20 border border-zinc-800 rounded-[3rem] hover:bg-zinc-900/40 hover:border-theme/30 transition-all text-center"
              >
                <div className="text-6xl mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                  {dept.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-theme transition-colors uppercase italic tracking-tight">
                  {dept.name}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-medium">
                  {dept.description}
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-theme opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Meet the Team <span className="text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-32 border-t border-zinc-900 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-20 text-center">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Contact Us</h2>
            <p className="text-theme font-bold tracking-[0.3em] uppercase text-xs italic">ช่องทางการติดต่อและติดตามข่าวสาร</p>
          </header>

          <div className="flex flex-wrap justify-center gap-8">
            {settings.show_email && settings.contact_email && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">📧</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Email Official</p>
                <p className="text-white font-bold break-all">{settings.contact_email}</p>
              </div>
            )}
            
            {settings.show_phone && settings.contact_phone && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">📞</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Hotline</p>
                <p className="text-white font-bold">{settings.contact_phone}</p>
              </div>
            )}

            {settings.show_line && settings.contact_line && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">🟢</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Line Official</p>
                <p className="text-white font-bold">{settings.contact_line}</p>
              </div>
            )}

            {settings.show_facebook && settings.contact_facebook && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">🔵</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Facebook</p>
                <p className="text-white font-bold">{settings.contact_facebook}</p>
              </div>
            )}

            {settings.show_instagram && settings.contact_instagram && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">🟣</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Instagram</p>
                <p className="text-white font-bold">{settings.contact_instagram}</p>
              </div>
            )}

            {settings.show_x && settings.contact_x && (
              <div className="flex-1 min-w-[280px] max-w-[320px] p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center group hover:border-theme/50 transition-all">
                <span className="text-4xl mb-4 block">⚫</span>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">X (Twitter)</p>
                <p className="text-white font-bold">{settings.contact_x}</p>
              </div>
            )}

            {/* Empty state if all toggles off */}
            {!settings.show_email && !settings.show_phone && !settings.show_line && 
             !settings.show_facebook && !settings.show_instagram && !settings.show_x && (
              <div className="text-center py-10 opacity-20 italic text-zinc-500 font-bold uppercase tracking-widest text-xs">
                No contact methods currently visible
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-zinc-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-theme/5 rounded-full blur-[100px] pointer-events-none"></div>
        <img src={settings.logo_url} className="w-12 h-12 mx-auto mb-8 opacity-20 grayscale" />
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.6em]">
          &copy; {new Date().getFullYear()} {settings.party_name.toUpperCase()} PARTY. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
