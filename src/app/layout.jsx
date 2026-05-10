import { AuthProvider } from '@/libs/auth-context';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/libs/supabase';
import ScrollProgress from '@/components/ScrollProgress';
import '../index.css';

export const revalidate = 0; // Disable cache for this layout to ensure fresh settings
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FUTURE PLUS | Student Council',
  description: 'ระบบจัดการข้อมูลสมาชิกพรรค Future Plus',
};

export default async function RootLayout({ children }) {
  // Fetch settings on the server to prevent theme flickering
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();

  const themeColor = settings?.theme_color || '#db2777';

  return (
    <html lang="th">
      <head>
        {/* Inject CSS variables immediately in the head to prevent FOUC (Flash of Unstyled Content) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-primary: ${themeColor};
            --theme-primary-glow: ${themeColor}44;
          }
        `}} />
      </head>
      <body className="bg-black text-white">
        <ThemeProvider initialSettings={settings}>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <ScrollProgress />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
