'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/store/AdminAuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/admin/login');
    }
  }, [isLoggedIn, loading, router]);

  // Still reading localStorage — show spinner, don't redirect yet
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
