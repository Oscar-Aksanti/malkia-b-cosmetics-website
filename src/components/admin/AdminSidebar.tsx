'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/store/AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard',    label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/produits',     label: 'Produits',         icon: Package         },
  { href: '/admin/commandes',    label: 'Commandes',        icon: ShoppingBag     },
  { href: '/admin/analytiques',  label: 'Analytiques',      icon: BarChart3       },
  { href: '/admin/contenu',      label: 'Contenu',          icon: FileText        },
  { href: '/admin/apparence',    label: 'Apparence',        icon: Palette         },
  { href: '/admin/parametres',   label: 'Paramètres',       icon: Settings        },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image src="/images/logos/logo-simplified.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Malkia B</p>
            <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase font-medium">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C9A84C]' : ''}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-[#C9A84C]/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/8">
        <div className="px-3 py-2.5 mb-2">
          <p className="text-white/70 text-xs font-medium">Hamim Banga</p>
          <p className="text-white/30 text-[10px]">Fondateur & CEO</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/8 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[#111111] border-r border-white/8 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-white/8 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 relative">
            <Image src="/images/logos/logo-simplified.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-white text-sm font-semibold">Malkia Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 h-full w-64 bg-[#111111] z-50 border-r border-white/8">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
