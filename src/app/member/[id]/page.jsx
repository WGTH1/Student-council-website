'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useTheme } from '@/components/ThemeProvider';

export default function MemberProfilePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { settings } = useTheme();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMember() {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) setMember(data);
      setLoading(false);
    }
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-black mb-4 uppercase italic">Member Not Found</h1>
        <Link href="/" className="text-theme font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: settings.theme_color }}></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative p-6 z-10 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <Link 
          href="/"
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-black uppercase tracking-widest hover:text-theme hover:border-theme transition-all"
        >
          Return Home
        </Link>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto p-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Side: Details */}
          <div className="flex-1 order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-block px-4 py-1 bg-theme text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-8 shadow-lg animate-fade-in" style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 20px ${settings.theme_color}33` }}>
              {member.role}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase italic">
              {member.name}
            </h1>
            
            {member.nickName && (
              <p className="text-theme text-2xl md:text-3xl font-black italic mb-8 tracking-wide" style={{ color: settings.theme_color }}>
                "{member.nickName}"
              </p>
            )}
            
            <div className="h-px w-full bg-gradient-to-r from-theme/50 via-zinc-800 to-transparent mb-12" style={{ backgroundImage: `linear-gradient(to right, ${settings.theme_color}88, #27272a, transparent)` }}></div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-4">Vision & Mission</h3>
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium italic">
                  {member.bio || `No description provided. This candidate is ready to drive ${settings.party_name} toward a better school environment.`}
                </p>
              </div>

              {/* Social Links */}
              {(member.facebook || member.instagram || member.x || member.discord) && (
                <div>
                  <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-6">Connect with Member</h3>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    {member.facebook && (
                      <a href={member.facebook.startsWith('http') ? member.facebook : `https://facebook.com/${member.facebook}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-theme hover:text-theme transition-all flex items-center gap-3 group">
                        <span className="text-xl group-hover:scale-120 transition-transform">🔵</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-theme hover:text-theme transition-all flex items-center gap-3 group">
                        <span className="text-xl group-hover:scale-120 transition-transform">🟣</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                      </a>
                    )}
                    {member.x && (
                      <a href={member.x.startsWith('http') ? member.x : `https://x.com/${member.x.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-theme hover:text-theme transition-all flex items-center gap-3 group">
                        <span className="text-xl group-hover:scale-120 transition-transform">⚫</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">X / Twitter</span>
                      </a>
                    )}
                    {member.discord && (
                      <div className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 group cursor-help" title="Copy Discord Tag">
                        <span className="text-xl">🎨</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{member.discord}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Affiliation</p>
                  <p className="text-white font-bold uppercase tracking-tight">{settings.party_name} Party</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                  <p className="text-green-500 font-bold uppercase tracking-tight">Active Personnel</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Image with Tech Frame */}
          <div className="w-full lg:w-[450px] order-1 lg:order-2 flex justify-center">
            <div className="relative group">
              {/* Modern Tech Frame Elements */}
              <div className="absolute -inset-4 border border-theme/20 rounded-[3rem] -rotate-3 group-hover:rotate-0 transition-transform duration-700" style={{ borderColor: `${settings.theme_color}33` }}></div>
              <div className="absolute -inset-4 border border-zinc-800 rounded-[3rem] rotate-3 group-hover:rotate-0 transition-transform duration-700 delay-75"></div>
              
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[2.5rem] overflow-hidden border-2 border-theme bg-zinc-900 shadow-2xl" style={{ borderColor: settings.theme_color, boxShadow: `0 20px 50px ${settings.theme_color}22` }}>
                {member.imageUrl ? (
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                    <img src={settings.logo_url} className="w-32 h-32 opacity-20 grayscale" />
                    <p className="mt-4 text-[10px] font-black text-zinc-700 tracking-[0.3em] uppercase">No Profile Image</p>
                  </div>
                )}
                
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Float Tags */}
              <div className="absolute -bottom-6 -left-6 bg-black border border-zinc-800 p-4 rounded-2xl shadow-2xl animate-bounce">
                <span className="text-2xl">✨</span>
              </div>
              <div className="absolute -top-6 -right-6 bg-theme p-4 rounded-full shadow-2xl" style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 30px ${settings.theme_color}66` }}>
                <img src={settings.logo_url} className="w-8 h-8 object-contain brightness-0 invert" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center">
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em]">
          Official Personnel Document &copy; {settings.party_name}
        </p>
      </footer>
    </div>
  );
}
