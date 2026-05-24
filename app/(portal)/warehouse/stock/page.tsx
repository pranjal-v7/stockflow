"use client";

import { useEffect, useState, useCallback } from "react";
import StockPanel from "@/components/warehouse/StockPanel";

interface StockEntry {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  product?: { id: string; name: string; sku: string };
  warehouse?: { id: string; name: string };
}

export default function WarehouseStockPage() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchStock = useCallback(async () => {
    try { setLoading(true); const res = await fetch("/api/stock"); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setStockEntries(data); }
    catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const startEdit = (e: StockEntry) => { setEditingId(e.id); setEditValue(String(e.totalUnits)); };
  const cancelEdit = () => { setEditingId(null); setEditValue(""); };

  const saveEdit = async (entry: StockEntry) => {
    const newTotal = parseInt(editValue, 10);
    if (isNaN(newTotal) || newTotal < 0) { alert("Invalid number"); return; }
    setSavingId(entry.id);
    try {
      const res = await fetch(`/api/stock/${entry.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalUnits: newTotal }) });
      if (!res.ok) throw new Error();
      const updated: StockEntry = await res.json();
      setStockEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...updated } : e));
      setEditingId(null);
    } catch { alert("Failed to update."); } finally { setSavingId(null); }
  };

  const filtered = stockEntries.filter(e =>
    e.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
    e.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8e4f0", letterSpacing: "-0.02em", marginBottom: 4 }}>Stock Management</h1>
          <p style={{ fontSize: "0.8125rem", color: "#5c5675" }}>View and update inventory levels across all warehouses</p>
        </div>
        <button onClick={fetchStock} className="btn-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
          Refresh
        </button>
      </div>

      {/* Stats panel */}
      {!loading && !error && <StockPanel stockEntries={stockEntries} />}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, marginTop: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c5675" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search product, SKU or warehouse…" value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" style={{ paddingLeft: 40 }} />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(13,13,24,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: "0.8125rem", color: "#5c5675" }}>Loading stock data…</p>
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "#f87171", marginBottom: 12 }}>{error}</p>
            <button onClick={fetchStock} className="btn-secondary">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3d3a52" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p style={{ color: "#5c5675", fontSize: "0.875rem" }}>No stock entries found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {["Product", "SKU", "Warehouse", "Total Units", "Reserved", "Available", "Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => {
                const isEditing = editingId === entry.id;
                const isSaving = savingId === entry.id;
                const available = entry.availableUnits ?? (entry.totalUnits - entry.reservedUnits);
                const lowStock = available <= 10;
                return (
                  <tr key={entry.id}>
                    <td><span style={{ fontWeight: 600, color: "#e8e4f0", fontSize: "0.875rem" }}>{entry.product?.name ?? "—"}</span></td>
                    <td><span className="sku">{entry.product?.sku ?? "—"}</span></td>
                    <td><span className="badge badge-cyan">{entry.warehouse?.name ?? "—"}</span></td>
                    <td>
                      {isEditing ? (
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                          min={0} autoFocus className="form-input" style={{ width: 100, padding: "6px 10px" }} />
                      ) : (
                        <span style={{ fontFamily: "var(--font-mono)", color: "#9d96b0" }}>{entry.totalUnits.toLocaleString()}</span>
                      )}
                    </td>
                    <td><span style={{ fontFamily: "var(--font-mono)", color: "#fbbf24" }}>{entry.reservedUnits.toLocaleString()}</span></td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: available === 0 ? "#f87171" : lowStock ? "#fbbf24" : "#34d399" }}>
                        {available.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => saveEdit(entry)} disabled={isSaving} className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                            id={`save-stock-${entry.id}`}>
                            {isSaving ? <div style={{ width: 11, height: 11, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> : "Save"}
                          </button>
                          <button onClick={cancelEdit} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(entry)} className="btn-edit" id={`edit-stock-${entry.id}`}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
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
        <p style={{ fontSize: "0.6875rem", color: "#3d3a52", textAlign: "right", marginTop: 12, fontFamily: "var(--font-mono)" }}>
          {filtered.length} / {stockEntries.length} entries
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
