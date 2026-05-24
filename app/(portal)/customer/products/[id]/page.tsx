"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, MapPin } from "lucide-react";
import GlowLine from "@/components/ui/GlowLine";

interface StockEntry {
  id: string;
  warehouseId: string;
  totalUnits: number;
  reservedUnits: number;
  warehouse: { id: string; name: string; location: string };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockEntries: StockEntry[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        const firstAvailable = data.stockEntries?.find((s: StockEntry) => s.totalUnits - s.reservedUnits > 0);
        if (firstAvailable) setSelectedWarehouse(firstAvailable.warehouseId);
        setLoading(false);
      });
  }, [id]);

  const selectedStock = product?.stockEntries.find((s) => s.warehouseId === selectedWarehouse);
  const available = selectedStock ? selectedStock.totalUnits - selectedStock.reservedUnits : 0;
  const totalAvailable = product?.stockEntries.reduce((sum, s) => sum + Math.max(0, s.totalUnits - s.reservedUnits), 0) ?? 0;

  const handleReserve = async () => {
    if (!session) { router.push("/login"); return; }
    if (!selectedWarehouse) { setError("Please select a warehouse"); return; }
    if (qty > available) { setError("Not enough stock available"); return; }
    setReserving(true);
    setError("");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": `res-${Date.now()}` },
      body: JSON.stringify({ productId: product!.id, warehouseId: selectedWarehouse, qty }),
    });
    const data = await res.json();
    if (res.status === 409) { setError("Stock just ran out — try a different warehouse."); setReserving(false); return; }
    if (!res.ok) { setError(data.error || "Reservation failed"); setReserving(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/customer/cart"), 1000);
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="glass" style={{ height: 380, borderRadius: 12, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[80, 48, 32, 120, 80].map((h, i) => (
            <div key={i} className="glass" style={{ height: h, borderRadius: 8, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!product) return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <Package size={32} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
      <p style={{ color: "rgba(255,255,255,0.3)" }}>Product not found</p>
    </div>
  );

  return (
    <div>
      {/* Back link */}
      <Link
        href="/customer/products"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none", marginBottom: 28, transition: "color 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
      >
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Product image placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass"
          style={{
            height: 380, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderTop: "1px solid rgba(20,184,166,0.2)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 50%, rgba(20,184,166,0.06) 0%, transparent 70%)",
            }}
          />
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={36} color="#14b8a6" />
          </div>
        </motion.div>

        {/* Product info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Category + name */}
          <div>
            {product.category && (
              <span className="font-mono-custom" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(20,184,166,0.7)", display: "block", marginBottom: 6 }}>
                {product.category}
              </span>
            )}
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 6 }}>
              {product.name}
            </h1>
            <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(20,184,166,0.6)" }}>{product.sku}</p>
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{product.description}</p>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.03em" }}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="font-mono-custom" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              / unit · {totalAvailable} available total
            </span>
          </div>

          {/* Warehouse selector */}
          <div>
            <p className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={11} /> Select Warehouse
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {product.stockEntries.map((s) => {
                const avail = s.totalUnits - s.reservedUnits;
                const isSelected = selectedWarehouse === s.warehouseId;
                const pct = s.totalUnits > 0 ? (avail / s.totalUnits) * 100 : 0;
                return (
                  <button
                    key={s.warehouseId}
                    id={`wh-${s.warehouseId}`}
                    onClick={() => { setSelectedWarehouse(s.warehouseId); setError(""); }}
                    disabled={avail === 0}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 8, textAlign: "left",
                      background: isSelected ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.06)"}`,
                      cursor: avail === 0 ? "not-allowed" : "pointer",
                      opacity: avail === 0 ? 0.4 : 1,
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#14b8a6" : "rgba(255,255,255,0.7)" }}>{s.warehouse.name}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.warehouse.location}</p>
                      </div>
                      <span className="font-mono-custom" style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: avail === 0 ? "rgba(239,68,68,0.1)" : avail <= 10 ? "rgba(245,158,11,0.1)" : "rgba(20,184,166,0.1)",
                        color: avail === 0 ? "#ef4444" : avail <= 10 ? "#f59e0b" : "#14b8a6",
                        border: `1px solid ${avail === 0 ? "rgba(239,68,68,0.2)" : avail <= 10 ? "rgba(245,158,11,0.2)" : "rgba(20,184,166,0.2)"}`,
                      }}>
                        {avail === 0 ? "Out of stock" : `${avail} avail`}
                      </span>
                    </div>
                    <GlowLine value={pct} color={avail === 0 ? "white" : avail <= 10 ? "amber" : "teal"} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Quantity</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                id="qty-minus"
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", minWidth: 32, textAlign: "center" }}>{qty}</span>
              <button
                id="qty-plus"
                onClick={() => setQty(Math.min(available, qty + 1))}
                style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
              >
                <Plus size={14} />
              </button>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                {available > 0 ? `of ${available} available` : "—"}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Reserve button */}
          <motion.button
            id="reserve-btn"
            onClick={handleReserve}
            disabled={reserving || available === 0 || success}
            whileHover={!reserving && available > 0 ? { scale: 1.01 } : {}}
            whileTap={!reserving && available > 0 ? { scale: 0.99 } : {}}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "14px",
              borderRadius: 8,
              background: success ? "rgba(52,211,153,0.12)" : available === 0 ? "rgba(255,255,255,0.03)" : "rgba(20,184,166,0.12)",
              border: `1px solid ${success ? "rgba(52,211,153,0.3)" : available === 0 ? "rgba(255,255,255,0.06)" : "rgba(20,184,166,0.3)"}`,
              color: success ? "#34d399" : available === 0 ? "rgba(255,255,255,0.25)" : "#14b8a6",
              fontSize: 14, fontWeight: 700,
              cursor: reserving || available === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: available > 0 && !success ? "0 0 20px rgba(20,184,166,0.08)" : "none",
              transition: "all 0.2s",
            }}
          >
            {reserving ? (
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(20,184,166,0.3)", borderTopColor: "#14b8a6", animation: "spin 0.8s linear infinite" }} />
            ) : success ? (
              "✓ Reserved! Redirecting to cart…"
            ) : available === 0 ? (
              "Out of Stock"
            ) : (
              <><ShoppingCart size={16} /> Reserve Now — ₹{(product.price * qty).toLocaleString("en-IN")}</>
            )}
          </motion.button>
          <p className="font-mono-custom" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.06em" }}>
            RESERVED ITEMS ARE HELD FOR 15 MINUTES
          </p>
        </motion.div>
      </div>
    </div>
  );
}
