"use client";

import { useEffect, useState, useCallback } from "react";
import StockPanel from "@/components/warehouse/StockPanel";

interface StockEntry {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export default function WarehouseStockPage() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock");
      if (!res.ok) throw new Error("Failed to fetch stock");
      const data = await res.json();
      setStockEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const startEdit = (entry: StockEntry) => {
    setEditingId(entry.id);
    setEditValue(String(entry.totalUnits));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (entry: StockEntry) => {
    const newTotal = parseInt(editValue, 10);
    if (isNaN(newTotal) || newTotal < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }
    setSavingId(entry.id);
    try {
      const res = await fetch(`/api/stock/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalUnits: newTotal }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated: StockEntry = await res.json();
      setStockEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, ...updated } : e))
      );
      setEditingId(null);
    } catch {
      alert("Failed to update stock.");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = stockEntries.filter(
    (e) =>
      e.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      e.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Stock Management</h2>
        <p className="text-sm text-slate-400 mt-0.5">View and update inventory levels across warehouses</p>
      </div>

      {/* Stats Panel */}
      {!loading && !error && <StockPanel stockEntries={stockEntries} />}

      {/* Search + refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search product, SKU or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
          />
        </div>
        <button
          onClick={fetchStock}
          className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading stock data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <button onClick={fetchStock} className="mt-3 text-xs text-slate-400 hover:text-white underline">
                Retry
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-400 text-sm">No stock entries found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {["Product Name", "SKU", "Warehouse", "Total Units", "Reserved", "Available", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((entry) => {
                const isEditing = editingId === entry.id;
                const isSaving = savingId === entry.id;
                const available = entry.availableUnits ?? (entry.totalUnits - entry.reservedUnits);
                const lowStock = available <= 10;

                return (
                  <tr key={entry.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-medium text-white group-hover:text-violet-300 transition-colors">
                        {entry.product?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {entry.product?.sku ?? "—"}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-slate-700/50 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full">
                        {entry.warehouse?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          min={0}
                          autoFocus
                          className="w-24 bg-slate-900 border border-violet-500 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      ) : (
                        <span className="text-slate-200 font-medium">{entry.totalUnits.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-amber-400 font-medium">
                      {entry.reservedUnits.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${available === 0 ? "text-red-400" : lowStock ? "text-amber-400" : "text-emerald-400"}`}>
                        {available.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(entry)}
                            disabled={isSaving}
                            id={`save-stock-${entry.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-xs font-medium transition-all disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(entry)}
                          id={`edit-stock-${entry.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-slate-500 text-right">
          Showing {filtered.length} of {stockEntries.length} entries
        </p>
      )}
    </div>
  );
}
