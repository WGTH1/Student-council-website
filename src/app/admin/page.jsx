'use client';

import Link from 'next/link';
import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export const departments = [
  { id: 'advisors', name: 'คณะที่ปรึกษา', icon: '👨‍🏫', description: 'ครูที่ปรึกษาและผู้ให้คำแนะนำ' },
  { id: 'admin', name: 'ฝ่ายบริหาร (สภา)', icon: '👑', description: 'ประธาน และรองประธาน' },
  { id: 'secretary', name: 'ฝ่ายเลขานุการ', icon: '📝', description: 'จัดการงานเอกสารและธุรการ' },
  { id: 'academic', name: 'ฝ่ายวิชาการ', icon: '📚', description: 'จัดการด้านการเรียนและวิชาการ' },
  { id: 'pr', name: 'ฝ่ายประชาสัมพันธ์', icon: '📢', description: 'สื่อสารข้อมูลข่าวสารสู่ภายนอก' },
  { id: 'building', name: 'ฝ่ายอาคารและสถานที่', icon: '🏢', description: 'ดูแลความเรียบร้อยของสถานที่' },
  { id: 'reception', name: 'ฝ่ายปฏิคม', icon: '🤝', description: 'ต้อนรับและดูแลแขกผู้มาเยือน' },
  { id: 'audio-visual', name: 'ฝ่ายโสตทัศนศึกษา', icon: '🎤', description: 'ดูแลระบบเสียงและสื่อประสม' },
  { id: 'activity', name: 'ฝ่ายกิจกรรมนักเรียน', icon: '🎉', description: 'วางแผนและดำเนินกิจกรรมต่างๆ' },
  { id: 'inspector', name: 'ฝ่ายสารวัตร', icon: '👮', description: 'ดูแลระเบียบวินัยนักเรียน' },
  { id: 'treasurer', name: 'เหรัญญิก', icon: '💰', description: 'จัดการด้านการเงินและบัญชี' },
];

export default function AdminPage() {
  const { isAdmin, loading, logout } = useAuth();
  const { settings } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin" style={{ borderColor: settings.theme_color, borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="px-4 py-1 bg-theme/10 border border-theme/20 rounded-full text-theme text-[10px] font-black uppercase tracking-widest" style={{ color: settings.theme_color, borderColor: `${settings.theme_color}33`, backgroundColor: `${settings.theme_color}11` }}>
            Admin Mode
          </div>
          <button 
            onClick={logout}
            className="text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:border-red-500/50 px-4 py-1 rounded-full bg-zinc-900/50"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8 py-16">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase italic">Personnel Directory</h2>
            <p className="text-zinc-500 font-medium">จัดการข้อมูลสมาชิกสภาแยกตามฝ่ายต่างๆ</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/admin/settings" 
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl hover:border-blue-500 hover:text-blue-500 transition-all shadow-xl uppercase text-xs tracking-widest flex items-center gap-3"
            >
              <span>⚙️</span> Site Settings
            </Link>
            <Link 
              href="/admin/suggestions" 
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl hover:border-theme hover:text-theme transition-all shadow-xl uppercase text-xs tracking-widest flex items-center gap-3"
            >
              <span>📮</span> View Suggestions
            </Link>
            <Link 
              href="/admin/news" 
              className="px-8 py-4 bg-theme text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg uppercase text-xs tracking-widest flex items-center gap-3"
              style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 20px ${settings.theme_color}33` }}
            >
              <span>📢</span> Manage News & Updates
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/admin/department/${dept.id}`}
              className="group relative p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-theme/50 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-theme rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: settings.theme_color, boxShadow: `0 10px 20px ${settings.theme_color}44` }}>
                  <span className="text-white">✏️</span>
                </div>
              </div>

              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 origin-left">
                {dept.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-theme transition-colors uppercase italic tracking-tight">
                {dept.name}
              </h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                {dept.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
