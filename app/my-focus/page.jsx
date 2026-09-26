'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyFocusPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tasks');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-slate-400 text-xs font-mono">Redirecting to Tasks...</p>
    </div>
  );
}
