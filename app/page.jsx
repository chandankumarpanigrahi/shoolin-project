'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';

/**
 * Root page — immediately redirects to /login or /dashboard
 * based on the stored authentication state from localStorage.
 * Renders nothing to avoid any flash / flicker.
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppContext();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Return null — no loader, no flash, just a clean redirect
  return null;
}

