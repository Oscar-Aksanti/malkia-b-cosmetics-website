'use client';

import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Download, ChevronDown } from 'lucide-react';
import type { OrderStatus } from '@/types';

interface MockOrder {
  id: string;
  items: { code: string; name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  date: string;
  lang: 'fr' | 'en';
  device: 'mobile' | 'desktop';
  city?: string;
}

const INITIAL_ORDERS: MockOrder[] = [
  { id: 'ORD-001', items: [{ code: 'MKB-0010', name: 'Biovène Éclat Suprême', qty: 1, price: 35 }], total: 35, status: 'confirmed', date: '2025-06-03 14:22', lang: 'fr', device: 'mobile', city: 'Kigali' },
  { id: 'ORD-002', items: [{ code: 'MKB-0017', name: 'Malkia Intense Parfum', qty: 2, price: 30 }], total: 60, status: 'pending',   date: '2025-06-03 11:05', lang: 'fr', device: 'mobile', city: 'Bukavu' },
  { id: 'ORD-003', items: [{ code: 'MKB-0004', name: 'AHA Body Lotion 3 Jours', qty: 1, price: 15 }], total: 15, status: 'delivered', date: '2025-06-02 18:40', lang: 'en', device: 'desktop', city: 'Nairobi' },
  { id: 'ORD-004', items: [{ code: 'MKB-0015', name: 'Anti-Acne Complete Set', qty: 1, price: 40 }], total: 40, status: 'pending',   date: '2025-06-02 09:13', lang: 'fr', device: 'mobile', city: 'Goma' },
  { id: 'ORD-005', items: [{ code: 'MKB-0020', name: 'Flat Tummy Tea 28 sachets', qty: 2, price: 15 }], total: 30, status: 'cancelled', date: '2025-06-01 16:55', lang: 'en', device: 'mobile' },
  { id: 'ORD-006', items: [{ code: 'MKB-0016', name: 'Extra Strong Molato Scrub', qty: 1, price: 20 }, { code: 'MKB-0003', name: 'Vitamin C Body Lotion', qty: 1, price: 15 }], total: 35, status: 'confirmed', date: '2025-05-31 10:30', lang: 'fr', device: 'mobile', city: 'Kigali' },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; cls: string; bg: string }> = {
  pending:   { label: 'En attente',  icon: Clock,        cls: 'text-amber-400 border-amber-400/30',   bg: 'bg-amber-400/10'   },
  confirmed: { label: 'Confirmé',    icon: CheckCircle,  cls: 'text-blue-400 border-blue-400/30',     bg: 'bg-blue-400/10'    },
  delivered: { label: 'Livré',       icon: Truck,        cls: 'text-emerald-400 border-emerald-400/30', bg: 'bg-emerald-400/10' },
  cancelled: { label: 'Annulé',      icon: XCircle,      cls: 'text-red-400 border-red-400/30',       bg: 'bg-red-400/10'     },
};

export default function AdminCommandesPage() {
  const [orders, setOrders]         = useState<MockOrder[]>(INITIAL_ORDERS);
  const [filterStatus, setFilter]   = useState<'all' | OrderStatus>('all');
  const [expandedId, setExpanded]   = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    revenue:   orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Date', 'Produits', 'Total (USD)', 'Statut', 'Langue', 'Appareil', 'Ville'],
      ...orders.map((o) => [
        o.id, o.date,
        o.items.map((i) => `${i.code} × ${i.qty}`).join(' | '),
        o.total, o.status, o.lang, o.device, o.city ?? '-',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'malkia-commandes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Commandes</h1>
              <p className="text-white/40 text-sm mt-1">Suivi des commandes WhatsApp</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/8 border border-white/10 hover:border-[#C9A84C]/40 text-white/70 hover:text-white rounded-xl text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total',      value: stats.total,     color: '#C9A84C', icon: ShoppingBag  },
              { label: 'En attente', value: stats.pending,   color: '#F59E0B', icon: Clock        },
              { label: 'Confirmées', value: stats.confirmed, color: '#3B82F6', icon: CheckCircle  },
              { label: 'Revenu',     value: `$${stats.revenue}`, color: '#10B981', icon: Truck    },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3 md:p-4">
                <Icon className="w-4 h-4 mb-2" style={{ color }} />
                <p className="text-white text-lg md:text-xl font-bold">{value}</p>
                <p className="text-white/40 text-[10px] font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-[#C9A84C] text-[#0D0D0D]'
                    : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                }`}
              >
                {s === 'all' ? 'Toutes' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {/* Orders list */}
          <div className="space-y-3">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${cfg.cls.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-mono text-xs font-semibold">{order.id}</span>
                        <span className="text-white/25 text-xs">·</span>
                        <span className="text-white/40 text-xs">{order.date}</span>
                        <span className="text-white/20 text-[10px] px-1.5 py-0.5 rounded border border-white/10">{order.lang.toUpperCase()}</span>
                        <span className="text-white/20 text-[10px]">{order.device}</span>
                      </div>
                      <p className="text-white/60 text-xs truncate">
                        {order.items.map((i) => `${i.name} × ${i.qty}`).join(' + ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white font-bold text-sm">${order.total}</span>
                      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.cls} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/8 p-4 bg-white/3">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Items */}
                        <div>
                          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Articles commandés</p>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div key={item.code} className="flex items-center justify-between">
                                <div>
                                  <span className="text-[#C9A84C] text-[10px] font-mono">{item.code}</span>
                                  <span className="text-white/70 text-xs ml-2">{item.name}</span>
                                  <span className="text-white/40 text-xs ml-1">× {item.qty}</span>
                                </div>
                                <span className="text-white text-xs font-semibold">${item.price * item.qty}</span>
                              </div>
                            ))}
                            <div className="border-t border-white/10 pt-1.5 flex justify-between">
                              <span className="text-white/50 text-xs">Total</span>
                              <span className="text-white font-bold text-sm">${order.total}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status change */}
                        <div>
                          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Changer le statut</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
                              const c = STATUS_CONFIG[s];
                              const SIcon = c.icon;
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                    order.status === s
                                      ? `${c.bg} ${c.cls}`
                                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                                  }`}
                                >
                                  <SIcon className="w-3 h-3" />
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                          {order.city && (
                            <p className="text-white/30 text-xs mt-3">📍 {order.city}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <ShoppingBag className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucune commande trouvée</p>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
