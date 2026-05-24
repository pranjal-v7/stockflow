"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CountdownTimer from "@/components/CountdownTimer";
import Link from "next/link";
import { ShoppingCart, Package, MapPin, CheckCircle, Trash2, ArrowRight } from "lucide-react";


interface Reservation {
  id: string;
  qty: number;
  expiresAt: string;
  status: string;
  product: { id: string; name: string; sku: string; price: number };
  warehouse: { name: string; location: string };
}

export default function CartPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "warn" } | null>(null);

  const fetchReservations = () => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((data) => { setReservations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleRelease = async (id: string) => {
    setReleasing(id);
    await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    setReservations((prev) => prev.filter((r) => r.id !== id));
    setReleasing(null);
  };

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    const data = await res.json();
    if (res.status === 410) {
      setMessage({ text: "Reservation expired — stock has been released.", type: "warn" });
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } else if (res.ok) {
      setMessage({ text: "Order confirmed! Redirecting…", type: "success" });
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setTimeout(() => router.push(`/customer/orders/${data.id}`), 1400);
    } else {
      setMessage({ text: data.error || "Confirmation failed.", type: "error" });
    }
    setConfirming(null);
  };

  const total = reservations.reduce((sum, r) => sum + r.product.price * r.qty, 0);

  const msgStyle = {
    success: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
    error:   { color: "#f87171", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
    warn:    { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <ShoppingCart size={20} color="#14b8a6" />
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
            Cart
          </h1>
        </div>
        <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
          {reservations.length} ACTIVE RESERVATION{reservations.length !== 1 ? "S" : ""} · CONFIRM BEFORE EXPIRY
        </p>
        <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, rgba(20,184,166,0.4), rgba(255,255,255,0.06) 40%, transparent)" }} />
      </motion.div>

      {/* Message banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginBottom: 20, padding: "12px 16px",
              background: msgStyle[message.type].bg,
              border: `1px solid ${msgStyle[message.type].border}`,
              borderRadius: 8, display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ fontSize: 13, color: msgStyle[message.type].color }}>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: msgStyle[message.type].color, fontSize: 18, lineHeight: 1 }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2].map((i) => (
            <div key={i} className="glass" style={{ height: 160, borderRadius: 10, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass"
          style={{ textAlign: "center", padding: "72px 24px", borderRadius: 12 }}
        >
          <ShoppingCart size={36} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 6 }}>Your cart is empty</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, marginBottom: 24 }}>
            Reserve products to see them here
          </p>
          <Link
            href="/customer/products"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 7,
              background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)",
              color: "#14b8a6", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            Browse Products <ArrowRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Reservation cards */}
          <AnimatePresence>
            {reservations.map((r, idx) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="glass"
                style={{ borderRadius: 10, overflow: "hidden", borderTop: "1px solid rgba(20,184,166,0.2)" }}
              >
                {/* Top accent */}
                <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)" }} />

                <div style={{ padding: "20px 22px" }}>
                  {/* Product row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Package size={18} color="#14b8a6" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{r.product.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="font-mono-custom" style={{ fontSize: 10, color: "rgba(20,184,166,0.7)" }}>{r.product.sku}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                            <MapPin size={9} /> {r.warehouse.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.02em" }}>
                        ₹{(r.product.price * r.qty).toLocaleString("en-IN")}
                      </p>
                      <p className="font-mono-custom" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                        ₹{r.product.price.toLocaleString("en-IN")} × {r.qty}
                      </p>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div style={{ marginBottom: 16 }}>
                    <CountdownTimer
                      expiresAt={r.expiresAt}
                      reservationId={r.id}
                      onExpired={() => setReservations((prev) => prev.filter((x) => x.id !== r.id))}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      id={`confirm-${r.id}`}
                      onClick={() => handleConfirm(r.id)}
                      disabled={confirming === r.id}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "10px", borderRadius: 7,
                        background: confirming === r.id ? "rgba(20,184,166,0.08)" : "rgba(20,184,166,0.12)",
                        border: "1px solid rgba(20,184,166,0.25)",
                        color: "#14b8a6", fontSize: 13, fontWeight: 600,
                        cursor: confirming === r.id ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {confirming === r.id ? (
                        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(20,184,166,0.3)", borderTopColor: "#14b8a6", animation: "spin 0.8s linear infinite" }} />
                      ) : (
                        <><CheckCircle size={14} /> Confirm Order</>
                      )}
                    </button>
                    <button
                      id={`release-${r.id}`}
                      onClick={() => handleRelease(r.id)}
                      disabled={releasing === r.id}
                      style={{
                        padding: "10px 14px", borderRadius: 7,
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        color: "rgba(239,68,68,0.7)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "inherit",
                      }}
                      title="Release reservation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Order total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: "18px 22px",
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div>
              <p className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4 }}>
                Order Total
              </p>
              <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.03em" }}>
                ₹{total.toLocaleString("en-IN")}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{reservations.length} item{reservations.length !== 1 ? "s" : ""} reserved</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Confirm each item individually</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
