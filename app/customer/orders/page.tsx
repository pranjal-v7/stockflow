"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowRight, Activity, Clock } from "lucide-react";
import GlowLine from "@/components/ui/GlowLine";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string };
  };
}

const STATUS: Record<string, { label: string; color: string; glow: "teal" | "amber" | "white" }> = {
  CONFIRMED: { label: "Confirmed",  color: "#14b8a6", glow: "teal"  },
  PACKED:    { label: "Packed",     color: "#f59e0b", glow: "amber" },
  SHIPPED:   { label: "Shipped",    color: "#60a5fa", glow: "white" },
  DELIVERED: { label: "Delivered",  color: "#34d399", glow: "teal"  },
  CANCELLED: { label: "Cancelled",  color: "#ef4444", glow: "white" },
};

const PIPELINE = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filters = ["ALL", ...Object.keys(STATUS)];
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Activity size={20} color="#14b8a6" />
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>My Orders</h1>
        </div>
        <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
          {filtered.length} ORDER{filtered.length !== 1 ? "S" : ""} · FULL ORDER HISTORY
        </p>
        <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, rgba(20,184,166,0.4), rgba(255,255,255,0.06) 40%, transparent)" }} />
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
              background: filter === f ? (f === "ALL" ? "rgba(20,184,166,0.25)" : `${STATUS[f]?.color}30`) : "rgba(0,0,0,0.6)",
              borderColor: filter === f ? (f === "ALL" ? "rgba(20,184,166,0.5)" : `${STATUS[f]?.color}50`) : "rgba(255,255,255,0.15)",
              color: filter === f ? (f === "ALL" ? "#14b8a6" : STATUS[f]?.color) : "rgba(255,255,255,0.5)",
              fontFamily: "inherit",
            }}
          >
            {f === "ALL" ? "All" : STATUS[f]?.label}
          </button>
        ))}
      </motion.div>

      {/* Orders list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass" style={{ height: 100, borderRadius: 10, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ textAlign: "center", padding: "60px 24px", borderRadius: 12 }}>
          <Package size={32} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No orders yet</p>
          <Link href="/customer/products" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "8px 18px", borderRadius: 6, background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#14b8a6", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Browse Products <ArrowRight size={12} />
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((order, idx) => {
              const st = STATUS[order.status] ?? { label: order.status, color: "#fff", glow: "white" as const };
              const pipelineStep = PIPELINE.indexOf(order.status);
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
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                          {order.reservation.product.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="font-mono-custom" style={{ fontSize: 10, color: "rgba(20,184,166,0.6)" }}>
                            {order.reservation.product.sku}
                          </span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                            {order.reservation.warehouse.name}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                            <Clock size={9} />
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
                          background: `${st.color}12`, border: `1px solid ${st.color}25`, color: st.color,
                        }} className="font-mono-custom">
                          {st.label.toUpperCase()}
                        </span>
                        <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b", marginTop: 4, letterSpacing: "-0.02em" }}>
                          ₹{(order.reservation.product.price * order.reservation.qty).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Pipeline track */}
                    {order.status !== "CANCELLED" && (
                      <div style={{ marginTop: 12, marginBottom: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          {PIPELINE.map((step, i) => (
                            <span key={step} className="font-mono-custom" style={{ fontSize: 8, letterSpacing: "0.1em", color: i <= pipelineStep ? st.color : "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                              {step}
                            </span>
                          ))}
                        </div>
                        <GlowLine
                          value={pipelineStep < 0 ? 0 : ((pipelineStep + 1) / PIPELINE.length) * 100}
                          color={st.glow}
                        />
                      </div>
                    )}

                    {/* Detail link */}
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                      >
                        View details <ArrowRight size={11} />
                      </Link>
                    </div>
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
