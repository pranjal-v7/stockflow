"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warehouse, Plus, MapPin } from "lucide-react";
import GlowLine from "@/components/ui/GlowLine";
import GlassCard from "@/components/ui/GlassCard";
import MetricNumber from "@/components/ui/MetricNumber";

interface WarehouseData {
  id: string;
  name: string;
  location: string;
  stockEntries?: { totalUnits: number; reservedUnits: number; productId: string }[];
}

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    const res = await fetch("/api/warehouses");
    const data = await res.json();
    setWarehouses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWarehouse),
    });
    if (res.ok) {
      setNewWarehouse({ name: "", location: "" });
      setShowAdd(false);
      await fetchWarehouses();
    }
    setSaving(false);
  };

  const totalUnits = warehouses.reduce((sum, w) => sum + (w.stockEntries?.reduce((s, e) => s + e.totalUnits, 0) ?? 0), 0);
  const totalAvail = warehouses.reduce((sum, w) => sum + (w.stockEntries?.reduce((s, e) => s + Math.max(0, e.totalUnits - e.reservedUnits), 0) ?? 0), 0);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <Warehouse size={20} color="#60a5fa" />
              <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Warehouses</h1>
            </div>
            <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
              {warehouses.length} WAREHOUSE{warehouses.length !== 1 ? "S" : ""} ACROSS NETWORK
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 7,
              background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
              color: "#60a5fa", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(96,165,250,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(96,165,250,0.1)"; }}
          >
            <Plus size={14} /> Add Warehouse
          </button>
        </div>
        <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.4), rgba(255,255,255,0.06) 40%, transparent)" }} />
      </motion.div>

      {/* Summary metrics */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <GlassCard title="Total Warehouses" accent="white" delay={0.05}>
            <MetricNumber value={warehouses.length} label="Active Locations" accent="white" />
          </GlassCard>
          <GlassCard title="Total Units" accent="amber" delay={0.1}>
            <MetricNumber value={totalUnits} label="Across All Warehouses" accent="amber" />
          </GlassCard>
          <GlassCard title="Available Units" accent="teal" delay={0.15}>
            <MetricNumber value={totalAvail} label="Ready to Reserve" accent="teal" />
          </GlassCard>
        </div>
      )}

      {/* Add warehouse form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 24 }}
          >
            <GlassCard title="New Warehouse" accent="white" animate={false}>
              <form onSubmit={handleAdd} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>
                    WAREHOUSE NAME
                  </label>
                  <input
                    type="text" required placeholder="e.g. Chennai South"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>
                    LOCATION
                  </label>
                  <input
                    type="text" required placeholder="e.g. Chennai, Tamil Nadu"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit" disabled={saving}
                    style={{ padding: "10px 20px", borderRadius: 7, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button" onClick={() => setShowAdd(false)}
                    style={{ padding: "10px 16px", borderRadius: 7, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warehouse grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass" style={{ height: 180, borderRadius: 12, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {warehouses.map((wh, idx) => {
            const total = wh.stockEntries?.reduce((s, e) => s + e.totalUnits, 0) ?? 0;
            const avail = wh.stockEntries?.reduce((s, e) => s + Math.max(0, e.totalUnits - e.reservedUnits), 0) ?? 0;
            const skus = new Set(wh.stockEntries?.map((e) => e.productId) ?? []).size;
            const pct = total > 0 ? (avail / total) * 100 : 0;
            const color = pct > 50 ? "teal" : pct > 20 ? "amber" : "white";

            return (
              <motion.div
                key={wh.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.08, duration: 0.45 }}
                style={{
                  position: "relative", borderRadius: 12, padding: 24,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderTop: "1px solid rgba(96,165,250,0.2)",
                  overflow: "hidden",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(96,165,250,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Corner + */}
                <span style={{ position: "absolute", top: 8, left: 10, fontSize: 11, color: "rgba(96,165,250,0.3)", fontFamily: "monospace" }} aria-hidden>+</span>
                <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 11, color: "rgba(96,165,250,0.3)", fontFamily: "monospace" }} aria-hidden>+</span>

                {/* Top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)" }} />

                {/* Icon + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Warehouse size={18} color="#60a5fa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{wh.name}</h3>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      <MapPin size={10} /> {wh.location}
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#60a5fa", letterSpacing: "-0.02em", lineHeight: 1 }}>{total.toLocaleString()}</p>
                    <p className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>TOTAL UNITS</p>
                  </div>
                  <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 16 }}>
                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#14b8a6", letterSpacing: "-0.02em", lineHeight: 1 }}>{avail.toLocaleString()}</p>
                    <p className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>AVAILABLE</p>
                  </div>
                  <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 16 }}>
                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.02em", lineHeight: 1 }}>{skus}</p>
                    <p className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>SKUS</p>
                  </div>
                </div>

                {/* Stock ratio bar */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>STOCK RATIO</span>
                    <span className="font-mono-custom" style={{ fontSize: 9, color: pct > 50 ? "#14b8a6" : pct > 20 ? "#f59e0b" : "#ef4444" }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <GlowLine value={pct} color={color} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
