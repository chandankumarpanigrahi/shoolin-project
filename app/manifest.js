/**
 * Web App Manifest — Shoolin Innovations Limited
 * Enables Android/iOS PWA installation with standalone display mode.
 */

export default function manifest() {
  return {
    name: 'Shoolin Innovations Limited',
    short_name: 'Shoolin OS',
    description:
      'Enterprise Project Operations OS — Manage projects, tasks, meetings, dependencies, and KPIs for Shoolin Innovations Limited.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    categories: ['business', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Go to project dashboard',
        url: '/dashboard',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'My Tasks',
        short_name: 'Tasks',
        description: 'View and manage your tasks',
        url: '/tasks',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
