/**
 * app/loading.jsx
 * Intentionally returns null at the root level.
 * A full-screen loader here fires on EVERY route transition and causes flicker.
 * Per-page loading states should be added at the segment level (e.g. app/dashboard/loading.jsx)
 * only for pages that actually do async data work.
 */
export default function Loading() {
  return null;
}

