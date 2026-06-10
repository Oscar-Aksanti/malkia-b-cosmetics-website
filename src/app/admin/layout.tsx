import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/store/AdminAuthContext';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Malkia Admin' },
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // html/body are provided by the root app/layout.tsx
  return (
    <AdminAuthProvider>
      <div className="bg-[#0D0D0D] text-white antialiased min-h-screen">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
