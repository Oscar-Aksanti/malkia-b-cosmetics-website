'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { PRODUCTS } from '@/lib/products-data';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Package, ShoppingBag, TrendingUp, Star, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

/* ── Mock order data (remplacé par Supabase quand configuré) ─────────────── */
const MOCK_ORDERS = [
  { id: 'ORD-001', products: 'Biovène Éclat Suprême × 1', total: 35, status: 'confirmed',  date: '2025-06-03', lang: 'fr' },
  { id: 'ORD-002', products: 'Malkia Intense × 2',         total: 60, status: 'pending',    date: '2025-06-03', lang: 'fr' },
  { id: 'ORD-003', products: 'AHA Body Lotion × 1',        total: 15, status: 'delivered',  date: '2025-06-02', lang: 'en' },
  { id: 'ORD-004', products: 'Anti-Acne Set × 1',          total: 40, status: 'pending',    date: '2025-06-02', lang: 'fr' },
  { id: 'ORD-005', products: 'Flat Tummy Tea × 2',         total: 30, status: 'cancelled',  date: '2025-06-01', lang: 'en' },
];

/* ── Derived stats ───────────────────────────────────────────────────────── */
const totalProducts  = PRODUCTS.length;
const featuredCount  = PRODUCTS.filter((p) => p.is_featured).length;
const totalRevenue   = MOCK_ORDERS.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
const pendingOrders  = MOCK_ORDERS.filter((o) => o.status === 'pending').length;

/* ── Category breakdown for pie chart ────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  body: '#C9A84C', face: '#E91E8C', fragrance: '#8B5CF6', wellness: '#10B981',
};
const CATEGORY_LABELS: Record<string, string> = {
  body: 'Corps', face: 'Visage', fragrance: 'Parfums', wellness: 'Bien-être',
};
const categoryData = Object.entries(
  PRODUCTS.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([key, value]) => ({ name: CATEGORY_LABELS[key] ?? key, value, color: CATEGORY_COLORS[key] ?? '#999' }));

/* ── Monthly revenue mock (bar chart) ────────────────────────────────────── */
const revenueData = [
  { month: 'Jan', rev: 320 }, { month: 'Fév', rev: 480 }, { month: 'Mar', rev: 390 },
  { month: 'Avr', rev: 620 }, { month: 'Mai', rev: 710 }, { month: 'Juin', rev: 580 },
];

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-400/15 text-amber-400 border-amber-400/30',
  confirmed: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
  delivered: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  cancelled: 'bg-red-400/15 text-red-400 border-red-400/30',
};
const STATUS_FR: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', delivered: 'Livré', cancelled: 'Annulé',
};

export default function DashboardPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[#C9A84C] text-sm font-medium mb-1">Bonjour, Hamin Banga 👋</p>
            <h1 className="text-white text-2xl md:text-3xl font-bold">Tableau de bord</h1>
            <p className="text-white/40 text-sm mt-1">Vue d&apos;ensemble de Malkia B Cosmetics</p>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Produits actifs',   value: totalProducts, icon: Package,     color: '#C9A84C', sub: `${featuredCount} en vedette`  },
              { label: 'Commandes reçues',  value: MOCK_ORDERS.length, icon: ShoppingBag, color: '#E91E8C', sub: `${pendingOrders} en attente`  },
              { label: 'Revenu estimé',     value: `$${totalRevenue}`, icon: TrendingUp, color: '#10B981', sub: 'commandes confirmées'          },
              { label: 'Note moyenne',      value: '4.9★',        icon: Star,        color: '#8B5CF6', sub: 'satisfaction client'            },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
                <p className="text-white/50 text-xs font-medium">{label}</p>
                <p className="text-white/30 text-[10px] mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Charts ───────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Revenue bar chart */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Revenu mensuel (USD)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`$${val}`, 'Revenu']}
                  />
                  <Bar dataKey="rev" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category pie chart */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Produits par catégorie</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {categoryData.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-white/60 text-xs flex-1">{name}</span>
                      <span className="text-white text-xs font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent orders ─────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-sm">Commandes récentes</h2>
              <Link href="/admin/commandes" className="flex items-center gap-1 text-[#C9A84C] text-xs hover:underline">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {MOCK_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{order.products}</p>
                    <p className="text-white/30 text-[10px]">{order.date} · {order.lang.toUpperCase()}</p>
                  </div>
                  <span className="text-white font-semibold text-sm">${order.total}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[order.status]}`}>
                    {STATUS_FR[order.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
