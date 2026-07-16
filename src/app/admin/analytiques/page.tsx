'use client';

import { useMemo, useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { PRODUCTS } from '@/lib/products-data';
import { getProducts, syncProductsFromDB, PRODUCTS_CHANGED_EVENT } from '@/lib/products-storage';
import type { Product } from '@/types';
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, ShoppingBag, DollarSign, Users, AlertTriangle } from 'lucide-react';

/* ── Simulated data ─────────────────────────────────────────────────────── */

const TOP_PRODUCTS = [
  { id: '10', ventes: 47, revenu: 1645 },
  { id: '17', ventes: 38, revenu: 1140 },
  { id: '16', ventes: 35, revenu: 700  },
  { id: '4',  ventes: 31, revenu: 465  },
  { id: '15', ventes: 28, revenu: 1120 },
  { id: '12', ventes: 22, revenu: 990  },
  { id: '5',  ventes: 19, revenu: 418  },
  { id: '1',  ventes: 17, revenu: 306  },
];

const CATEGORY_REVENUE = [
  { name: 'Corps',      revenu: 3420, color: '#C9A84C' },
  { name: 'Visage',     revenu: 4890, color: '#E91E8C' },
  { name: 'Parfums',    revenu: 2940, color: '#8B5CF6' },
  { name: 'Bien-être',  revenu: 680,  color: '#10B981' },
];

const LANGUAGE_DATA = [
  { name: 'Français', value: 68, color: '#C9A84C' },
  { name: 'English',  value: 32, color: '#E91E8C' },
];

const DEVICE_DATA = [
  { name: 'Mobile',  value: 82, color: '#8B5CF6' },
  { name: 'Desktop', value: 18, color: '#10B981' },
];

// 30-day orders trend (simulated growth)
const ORDERS_TREND = Array.from({ length: 30 }, (_, i) => {
  const base = Math.floor(2 + (i / 30) * 4);
  const jitter = Math.floor(Math.random() * 3);
  return { day: `J${i + 1}`, commandes: base + jitter };
});

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
  },
  labelStyle: { color: 'rgba(255,255,255,0.5)' },
};

const maxRevenu = Math.max(...TOP_PRODUCTS.map((p) => p.revenu));

export default function AdminAnalytiquesPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    setProducts(getProducts());
    syncProductsFromDB().then((fresh) => { if (fresh.length > 0) setProducts(fresh); });

    const onChanged = (e: Event) => {
      const d = (e as CustomEvent<Product[]>).detail;
      if (d?.length) setProducts(d);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_products') setProducts(getProducts());
    };
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const topProductsWithData = useMemo(
    () =>
      TOP_PRODUCTS.map((tp) => {
        const product = products.find((p) => p.id === tp.id);
        return { ...tp, product };
      }).filter((tp) => tp.product),
    [products]
  );

  const stockAlerts = products.filter((p) => p.stock_status !== 'in_stock');

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Analytiques</h1>
              <p className="text-white/40 text-sm mt-1">Vue d&apos;ensemble des performances</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-400 text-xs font-medium">Données simulées · Connectez Supabase pour les données réelles</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Vues totales',       value: '12 847',  icon: Eye,        color: '#C9A84C', trend: '+12%', up: true  },
              { label: 'Taux conversion',    value: '3.2%',    icon: TrendingUp, color: '#E91E8C', trend: '+0.4%',up: true  },
              { label: 'Panier moyen',       value: '$42',     icon: DollarSign, color: '#8B5CF6', trend: '+$3', up: true  },
              { label: 'Clients récurrents', value: '68%',     icon: Users,      color: '#10B981', trend: '-2%', up: false },
            ].map(({ label, value, icon: Icon, color, trend, up }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                  </span>
                </div>
                <p className="text-white text-xl font-bold">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Top products — full width */}
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-white/8">
              <h2 className="text-white font-semibold text-sm">Top produits par revenu</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-medium">#</th>
                    <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-medium">Produit</th>
                    <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">Code</th>
                    <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-medium hidden md:table-cell">Catégorie</th>
                    <th className="px-4 py-3 text-right text-white/30 text-xs uppercase tracking-wider font-medium">Ventes</th>
                    <th className="px-4 py-3 text-right text-white/30 text-xs uppercase tracking-wider font-medium">Revenu</th>
                    <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-medium hidden lg:table-cell w-32">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsWithData.map((tp, idx) => {
                    const { product, ventes, revenu } = tp;
                    if (!product) return null;
                    const pct = Math.round((revenu / maxRevenu) * 100);
                    const catLabels: Record<string, string> = { body: 'Corps', face: 'Visage', fragrance: 'Parfums', wellness: 'Bien-être' };
                    return (
                      <tr key={tp.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${idx === 0 ? 'text-[#C9A84C]' : idx === 1 ? 'text-white/60' : idx === 2 ? 'text-amber-700' : 'text-white/30'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white text-xs font-medium truncate max-w-[160px]">{product.name_fr}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-[#C9A84C] text-[10px] font-mono">{product.product_code}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-white/40 text-xs">{catLabels[product.category]}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-white text-xs font-semibold">{ventes}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-emerald-400 text-xs font-semibold">${revenu}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: idx === 0 ? '#C9A84C' : idx % 2 === 0 ? '#8B5CF6' : '#E91E8C' }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Revenue by category */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Revenu par catégorie (USD)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CATEGORY_REVENUE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`$${v}`, 'Revenu']} />
                  <Bar dataKey="revenu" radius={[6, 6, 0, 0]}>
                    {CATEGORY_REVENUE.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Orders trend */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Commandes — 30 derniers jours</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ORDERS_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Commandes']} />
                  <Line
                    type="monotone"
                    dataKey="commandes"
                    stroke="#C9A84C"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#C9A84C' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Language split */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Trafic par langue et appareil</h2>
              <div className="flex gap-4">
                {/* Language pie */}
                <div className="flex-1">
                  <p className="text-white/40 text-xs text-center mb-2">Langue</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={LANGUAGE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {LANGUAGE_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {LANGUAGE_DATA.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-white/50 text-[10px]">{d.name} {d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device pie */}
                <div className="flex-1">
                  <p className="text-white/40 text-xs text-center mb-2">Appareil</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={DEVICE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {DEVICE_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {DEVICE_DATA.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-white/50 text-[10px]">{d.name} {d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stock alerts */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-semibold text-sm">Alertes stock</h2>
              </div>
              {stockAlerts.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-sm">Tous les produits sont bien approvisionnés.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {stockAlerts.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        p.stock_status === 'out_of_stock'
                          ? 'bg-red-500/8 border-red-500/20'
                          : 'bg-amber-500/8 border-amber-500/20'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.name_fr}</p>
                        <p className="text-[#C9A84C] text-[10px] font-mono">{p.product_code}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.stock_status === 'out_of_stock'
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-amber-400 bg-amber-400/10'
                      }`}>
                        {p.stock_status === 'out_of_stock' ? 'Épuisé' : 'Stock faible'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
