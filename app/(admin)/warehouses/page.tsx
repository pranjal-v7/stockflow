"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  stockEntries?: { totalUnits: number; productId: string }[];
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-emerald-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-base font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/warehouses");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const getProductCount = (w: Warehouse) => {
    const unique = new Set(w.stockEntries?.map((e) => e.productId) ?? []);
    return unique.size;
  };

  const getTotalUnits = (w: Warehouse) =>
    w.stockEntries?.reduce((s, e) => s + e.totalUnits, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Warehouses</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage your fulfilment network</p>
        </div>
        <button
          onClick={() => alert("Add Warehouse form coming soon")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Warehouse
        </button>
      </div>

      {/* Summary bar */}
      {!loading && !error && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 grid grid-cols-3 gap-6 divide-x divide-slate-700">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Warehouses</p>
            <p className="text-3xl font-bold text-white mt-1">{warehouses.length}</p>
          </div>
          <div className="pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Products Stored</p>
            <p className="text-3xl font-bold text-white mt-1">
              {warehouses.reduce((s, w) => s + getProductCount(w), 0).toLocaleString()}
            </p>
          </div>
          <div className="pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Stock Units</p>
            <p className="text-3xl font-bold text-white mt-1">
              {warehouses.reduce((s, w) => s + getTotalUnits(w), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Warehouse Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Loading warehouses...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchWarehouses} className="mt-3 text-xs text-slate-400 hover:text-white underline">
              Retry
            </button>
          </div>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-slate-400 text-sm">No warehouses configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => {
            const productCount = getProductCount(warehouse);
            const totalUnits = getTotalUnits(warehouse);
            return (
              <div
                key={warehouse.id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-emerald-500/40 hover:bg-slate-700/50 transition-all duration-200 group"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
                        {warehouse.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {warehouse.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700 my-4"></div>

                {/* Stats */}
                <div className="space-y-3">
                  <StatCard
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    }
                    label="Unique Products"
                    value={productCount.toLocaleString()}
                  />
                  <StatCard
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    }
                    label="Total Stock Units"
                    value={totalUnits.toLocaleString()}
                  />
                </div>

                {/* Footer actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                  <Link
                    href={`/warehouse/stock?warehouseId=${warehouse.id}`}
                    className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
                  >
                    View Stock
                  </Link>
                  <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all">
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
