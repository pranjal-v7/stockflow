"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, Warehouse, ShoppingBag, Clock, AlertTriangle,
  TrendingUp, CheckCircle, Truck, RefreshCw
} from "lucide-react";

interface Metrics {
  activeReservations: number;
  expiredLast1h: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalWarehouses: number;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  outOfStockItems: number;
  lowStockItems: Array<{ productName: string; warehouseName: string; available: number; total: number }>;
  timestamp: string;
}

function MetricCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string;
}) {
  return (
    <div className={`bg-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchMetrics = useCallback(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) { setMetrics(data); setLastRefreshed(new Date()); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse border border-slate-700/50" />)}
    </div>
  );

  if (!metrics) return <div className="text-red-400">Failed to load metrics. Are you logged in as Admin?</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Last updated: {lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 30s
          </p>
        </div>
        <button onClick={fetchMetrics} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 text-sm transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Reservations" value={metrics.activeReservations} icon={Clock} color="bg-amber-500/20 text-amber-400" sub="PENDING status" />
        <MetricCard label="Total Orders" value={metrics.totalOrders} icon={ShoppingBag} color="bg-violet-500/20 text-violet-400" sub={`${metrics.ordersByStatus?.CONFIRMED || 0} confirmed`} />
        <MetricCard label="Total Products" value={metrics.totalProducts} icon={Package} color="bg-blue-500/20 text-blue-400" sub={`${metrics.outOfStockItems} out of stock`} />
        <MetricCard label="Warehouses" value={metrics.totalWarehouses} icon={Warehouse} color="bg-emerald-500/20 text-emerald-400" sub="Active locations" />
      </div>

      {/* Stock metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-1">Total Units</p>
          <p className="text-2xl font-bold text-white">{metrics.totalUnits.toLocaleString()}</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-1">Available Units</p>
          <p className="text-2xl font-bold text-emerald-400">{metrics.availableUnits.toLocaleString()}</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.totalUnits > 0 ? (metrics.availableUnits / metrics.totalUnits) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-1">Reserved Units</p>
          <p className="text-2xl font-bold text-amber-400">{metrics.reservedUnits.toLocaleString()}</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.totalUnits > 0 ? (metrics.reservedUnits / metrics.totalUnits) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Orders by status + Expiry stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Orders by Status
          </h2>
          <div className="space-y-2">
            {["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map((s) => {
              const count = metrics.ordersByStatus?.[s] || 0;
              const colorMap: Record<string, string> = {
                CONFIRMED: "bg-blue-500", PACKED: "bg-amber-500",
                SHIPPED: "bg-violet-500", DELIVERED: "bg-emerald-500",
              };
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{s}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colorMap[s]}`} style={{ width: `${metrics.totalOrders > 0 ? (count / metrics.totalOrders) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-bold text-white w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Expiry & Reliability
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-xs text-amber-300">Expired reservations (last 1h)</span>
              <span className="text-lg font-bold text-amber-400">{metrics.expiredLast1h}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-xs text-red-300">Out of stock entries</span>
              <span className="text-lg font-bold text-red-400">{metrics.outOfStockItems}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-xs text-emerald-300">Delivered orders</span>
              <span className="text-lg font-bold text-emerald-400">{metrics.ordersByStatus?.DELIVERED || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {metrics.lowStockItems.length > 0 && (
        <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Alerts
            <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs">{metrics.lowStockItems.length} items</span>
          </h2>
          <div className="space-y-2">
            {metrics.lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{item.productName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Warehouse className="w-3 h-3" />{item.warehouseName}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${item.available === 0 ? "text-red-400" : "text-amber-400"}`}>{item.available}</p>
                  <p className="text-xs text-slate-500">of {item.total} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
