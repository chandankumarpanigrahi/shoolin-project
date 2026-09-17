/**
 * app/sw.js
 * Serwist Service Worker for Shoolin Innovations Limited PWA.
 *
 * Handles:
 * - Precaching of all Next.js build assets (JS, CSS, images)
 * - Runtime caching strategy for API/navigation requests
 * - Offline fallback to cached content
 */

import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const revision = crypto.randomUUID();

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
