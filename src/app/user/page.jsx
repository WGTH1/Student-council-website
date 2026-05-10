'use client';

import Link from 'next/link';
import { useAuth } from '@/libs/auth-context';
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

export default function UserPage() {
  const { settings } = useTheme();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black italic text-xl tracking-tighter group-hover:text-theme transition-colors uppercase">{settings.party_name}</span>
        </Link>
        <div className="px-4 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-widest">
          Personnel Archive
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8 py-16">
        <header className="mb-16 text-center">
          <h2 className="text-5xl font-black text-white mb-4 uppercase italic tracking-tight">ทำเนียบสภานักเรียน</h2>
          <div className="flex flex-col items-center gap-4">
             <p className="text-theme font-bold tracking-[0.3em] uppercase text-sm" style={{ color: settings.theme_color }}>Personnel Directory</p>
             <Link href="/news" className="mt-4 px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-theme hover:border-theme transition-all flex items-center gap-2">
               <span>📢</span> Read Latest Announcements
             </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/user/department/${dept.id}`}
              className="group relative p-10 bg-zinc-900/20 border border-zinc-800 rounded-[3rem] hover:bg-zinc-900/40 hover:border-theme/30 transition-all text-center"
            >
              <div className="text-6xl mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                {dept.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-theme transition-colors uppercase italic">
                {dept.name}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
                {dept.description}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-theme opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" style={{ color: settings.theme_color }}>
                View Members <span className="text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
