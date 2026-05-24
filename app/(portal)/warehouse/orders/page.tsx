"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, User, MapPin, ArrowRight, Activity, CheckCircle } from "lucide-react";
import GlowLine from "@/components/ui/GlowLine";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  deliveryAgent: { name: string; email: string } | null;
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string; location: string };
  };
}

const STATUS: Record<string, { label: string; color: string; glow: "teal" | "amber" | "white" }> = {
  CONFIRMED: { label: "Confirmed",  color: "#14b8a6", glow: "teal"  },
  PACKED:    { label: "Packed",     color: "#f59e0b", glow: "amber" },
  SHIPPED:   { label: "Shipped",    color: "#60a5fa", glow: "white" },
  DELIVERED: { label: "Delivered",  color: "#34d399", glow: "teal"  },
  CANCELLED: { label: "Cancelled",  color: "#ef4444", glow: "white" },
};
const PIPELINE = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;
const NEXT: Record<string, string> = { CONFIRMED: "PACKED", PACKED: "SHIPPED", SHIPPED: "DELIVERED" };

export default function WarehouseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const handleAdvance = async (orderId: string, nextStatus: string) => {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
    }
    setUpdating(null);
  };

  const filters = ["ALL", ...Object.keys(STATUS)];
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Activity size={20} color="#f59e0b" />
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Order Pipeline</h1>
        </div>
        <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
          {filtered.length} ORDER{filtered.length !== 1 ? "S" : ""} · MANAGE FULFILLMENT STATUS
        </p>
        <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, rgba(245,158,11,0.4), rgba(255,255,255,0.06) 40%, transparent)" }} />
      </motion.div>

      {/* Filter pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 500,
              cursor: "pointer", border: "1px solid", transition: "all 0.15s",
              background: filter === f ? (f === "ALL" ? "rgba(245,158,11,0.12)" : `${STATUS[f]?.color}12`) : "rgba(255,255,255,0.03)",
              borderColor: filter === f ? (f === "ALL" ? "rgba(245,158,11,0.35)" : `${STATUS[f]?.color}35`) : "rgba(255,255,255,0.08)",
              color: filter === f ? (f === "ALL" ? "#f59e0b" : STATUS[f]?.color) : "rgba(255,255,255,0.4)",
              fontFamily: "inherit",
            }}
          >
            {f === "ALL" ? "All" : STATUS[f]?.label}
          </button>
        ))}
      </motion.div>

      {/* Orders */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass" style={{ height: 130, borderRadius: 10, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ textAlign: "center", padding: "60px 24px", borderRadius: 12 }}>
          <CheckCircle size={32} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No orders to show</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((order, idx) => {
              const st = STATUS[order.status] ?? { label: order.status, color: "#fff", glow: "white" as const };
              const nextStatus = NEXT[order.status];
              const pipelineStep = PIPELINE.indexOf(order.status as typeof PIPELINE[number]);

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  style={{
                    borderRadius: 10, overflow: "hidden",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: `1px solid ${st.color}25`,
                  }}
                >
                  <div style={{ padding: "18px 20px" }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                          {order.reservation.product.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span className="font-mono-custom" style={{ fontSize: 10, color: "rgba(20,184,166,0.6)" }}>
                            {order.reservation.product.sku}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                            <User size={9} /> {order.customer.name}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                            <MapPin size={9} /> {order.reservation.warehouse.name}
                          </span>
                          <span className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
                          background: `${st.color}12`, border: `1px solid ${st.color}25`, color: st.color,
                          display: "block", marginBottom: 4,
                        }} className="font-mono-custom">
                          {st.label.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.02em" }}>
                          ₹{(order.reservation.product.price * order.reservation.qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Pipeline tracker */}
                    {order.status !== "CANCELLED" && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          {PIPELINE.map((step, i) => (
                            <span key={step} className="font-mono-custom" style={{ fontSize: 8, color: i <= pipelineStep ? st.color : "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {step}
                            </span>
                          ))}
                        </div>
                        <GlowLine value={pipelineStep < 0 ? 0 : ((pipelineStep + 1) / PIPELINE.length) * 100} color={st.glow} />
                      </div>
                    )}

                    {/* Advance button */}
                    {nextStatus && (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleAdvance(order.id, nextStatus)}
                          disabled={updating === order.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 16px", borderRadius: 6,
                            background: `${STATUS[nextStatus]?.color}10`,
                            border: `1px solid ${STATUS[nextStatus]?.color}25`,
                            color: STATUS[nextStatus]?.color,
                            fontSize: 11, fontWeight: 700,
                            cursor: updating === order.id ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            opacity: updating === order.id ? 0.6 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {updating === order.id ? (
                            <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${STATUS[nextStatus]?.color}30`, borderTopColor: STATUS[nextStatus]?.color, animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <>Mark as {STATUS[nextStatus]?.label} <ArrowRight size={11} /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
