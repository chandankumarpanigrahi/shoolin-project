import '../styles/globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Shoolin Innovations Limited - Enterprise Project Operations OS',
  description:
    'High-velocity enterprise project operations platform for managing projects, hierarchical tasks, meetings, dependencies, links, and KPI dashboards for Shoolin Innovations Limited.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shoolin OS',
  },
  openGraph: {
    title: 'Shoolin Innovations Limited - Enterprise Project Operations OS',
    description:
      'High-velocity enterprise project operations platform for managing projects, hierarchical tasks, meetings, dependencies, links, and KPI dashboards for Shoolin Innovations Limited.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          THEME FLASH PREVENTION — runs synchronously before first paint.
          Reads theme from localStorage and applies .dark class immediately
          so there is zero FOUC (flash of unstyled content) on page load/navigation.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('pulsepm_theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* PWA Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        {/* Splash screen color */}
        <meta name="theme-color" content="#4f46e5" />
        {/* Disable tap delay on Android */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased font-sans">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
