import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { GovTechNavbar } from '@/components/GovTechNavbar';

export const metadata: Metadata = {
  title: 'SCHEMATRIX — AI-Powered Indian Welfare Schemes Discovery',
  description:
    'One Unified Digital Platform for Indian Citizen Entitlements, Public Services, Deterministic Eligibility, and AI Sahayak in English, Hindi, and Telugu.',
  generator: 'SCHEMATRIX GovTech',
  keywords: [
    'Indian Government Schemes',
    'PM-KISAN',
    'Ayushman Bharat',
    'PMAY-G',
    'MGNREGA',
    'NFSA Ration',
    'GovTech India',
    'Welfare Eligibility',
    'Citizen Services',
  ],
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {/* Universal Accessibility Toolbar */}
            <AccessibilityBar />

            {/* Primary GovTech Header Navigation */}
            <GovTechNavbar />

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
