import '../styles/globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Shoolin Innovations Limited - Enterprise Project Operations OS',
  description:
    'High-velocity enterprise project operations platform for managing projects, hierarchical tasks, meetings, dependencies, links, and KPI dashboards for Shoolin Innovations Limited.',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased font-sans">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
