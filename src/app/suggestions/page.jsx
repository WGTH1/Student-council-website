'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/libs/supabase';
import { useTheme } from '@/components/ThemeProvider';

export default function SuggestionsPage() {
  const [formData, setFormData] = useState({ title: '', content: '', type: 'General' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .insert([formData]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      alert('Error sending suggestion: ' + err.message + '\nNote: Please ensure the "suggestions" table exists in your Supabase project.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-theme rounded-full flex items-center justify-center mb-8 shadow-theme animate-bounce" style={{ backgroundColor: settings.theme_color, boxShadow: `0 0 40px ${settings.theme_color}88` }}>
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">Message Received</h1>
        <p className="text-zinc-500 max-w-md mb-12 font-medium">ขอบคุณสำหรับข้อเสนอแนะ! เสียงของคุณมีค่ามากสำหรับพวกเราพรรค {settings.party_name}</p>
        <Link href="/" className="px-10 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-theme hover:text-theme transition-all font-black uppercase text-xs tracking-[0.2em]">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: settings.theme_color }}></div>
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="px-4 py-1 bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-full text-zinc-500">
          DIGITAL BOX SYSTEM
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-theme text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-6 text-white" style={{ backgroundColor: settings.theme_color }}>
            Digital Suggestion Box
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
            {settings.party_name.split(' ')[0]} <span className="text-theme" style={{ color: settings.theme_color }}>Box</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium italic">
            "เสียงของทุกคน คือพลังในการขับเคลื่อนอนาคต" <br />
            พื้นที่รับฟังความคิดเห็นและข้อเสนอแนะเพื่อพัฒนาโรงเรียนของเรา
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Topic / Title</label>
              <input
                type="text"
                required
                placeholder="ระบุหัวเรื่อง..."
                className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white placeholder:text-zinc-800"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                style={{ borderColor: formData.title ? settings.theme_color : '#27272a' }}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Category</label>
              <select
                className="w-full p-5 bg-black border border-zinc-800 rounded-[1.5rem] focus:border-theme outline-none transition-all text-white appearance-none"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
              >
                <option value="General">ทั่วไป (General)</option>
                <option value="Academic">วิชาการ (Academic)</option>
                <option value="Activity">กิจกรรม (Activity)</option>
                <option value="Facility">อาคารสถานที่ (Facility)</option>
                <option value="Policy">ข้อเสนอเชิงนโยบาย (Policy)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-600 ml-1 uppercase tracking-[0.2em]">Your Message</label>
            <textarea
              rows="6"
              required
              placeholder="พิมพ์ข้อความของคุณที่นี่..."
              className="w-full p-6 bg-black border border-zinc-800 rounded-[2rem] focus:border-theme outline-none transition-all text-white placeholder:text-zinc-800 resize-none leading-relaxed"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
              style={{ borderColor: formData.content ? settings.theme_color : '#27272a' }}
            />
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-theme text-white font-black rounded-2xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-50"
              style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 30px ${settings.theme_color}44` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>🚀 Send Suggestion</>
              )}
            </button>
          </div>
        </form>

        <div className="mt-20 text-center">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em]">
            Secure & Anonymous Feedback Channel
          </p>
        </div>
      </main>
    </div>
  );
}
