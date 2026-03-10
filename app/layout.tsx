import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Onboarding } from '@/components/onboarding';
import { UserProvider } from '@/lib/store';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SafeSurf',
  description: 'Learn cybersecurity the fun way.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
        <UserProvider>
          <Onboarding>
            <Navbar />
            <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </Onboarding>
        </UserProvider>
      </body>
    </html>
  );
}
