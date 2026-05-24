"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import GlowLine from "@/components/ui/GlowLine";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description?: string;
  stockEntries?: { totalUnits: number; reservedUnits: number }[];
}

function getAvailable(p: Product) {
  return p.stockEntries?.reduce((s, e) => s + Math.max(0, e.totalUnits - e.reservedUnits), 0) ?? 0;
}
function getTotal(p: Product) {
  return p.stockEntries?.reduce((s, e) => s + e.totalUnits, 0) ?? 0;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <Package size={20} color="#14b8a6" />
              <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Products</h1>
            </div>
            <p className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
              {filtered.length} PRODUCT{filtered.length !== 1 ? "S" : ""} IN CATALOG
            </p>
          </div>
          <Link
            href="/admin/products/new"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 7,
              background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)",
              color: "#14b8a6", fontSize: 13, fontWeight: 600, textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(20,184,166,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Plus size={14} /> Add Product
          </Link>
        </div>
        <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, rgba(20,184,166,0.4), rgba(255,255,255,0.06) 40%, transparent)" }} />
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: 24 }}>
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 8, maxWidth: 400 }}>
          <Search size={14} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search products, SKUs, categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13 }}
          />
        </div>
      </motion.div>

      {/* Table-style list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass" style={{ height: 72, borderRadius: 8, animation: "glow-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 120px 110px 120px 100px 110px",
            padding: "8px 16px", marginBottom: 8,
          }}>
            {["Product", "SKU", "Category", "Price", "Stock", "Actions"].map((h) => (
              <span key={h} className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                {h}
              </span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ textAlign: "center", padding: "52px 24px", borderRadius: 10 }}>
              <Package size={28} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No products found</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((product, idx) => {
                  const avail = getAvailable(product);
                  const total = getTotal(product);
                  const pct = total > 0 ? (avail / total) * 100 : 0;
                  const stockColor = pct > 50 ? "teal" : pct > 20 ? "amber" : "white";

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 120px 110px 120px 100px 110px",
                        alignItems: "center",
                        padding: "14px 16px",
                        borderRadius: 8,
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.background = "rgba(0,0,0,0.25)";
                      }}
                    >
                      {/* Name */}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{product.name}</p>
                        {product.description && (
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* SKU */}
                      <span className="font-mono-custom" style={{ fontSize: 11, color: "rgba(20,184,166,0.7)" }}>
                        {product.sku}
                      </span>

                      {/* Category */}
                      <span style={{
                        fontSize: 10, padding: "3px 8px", borderRadius: 4,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.5)", width: "fit-content",
                      }}>
                        {product.category || "—"}
                      </span>

                      {/* Price */}
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", letterSpacing: "-0.02em" }}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>

                      {/* Stock */}
                      <div style={{ width: 80 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span className="font-mono-custom" style={{ fontSize: 9, color: pct === 0 ? "#ef4444" : pct <= 30 ? "#f59e0b" : "#14b8a6" }}>
                            {avail}/{total}
                          </span>
                        </div>
                        <GlowLine value={pct} color={stockColor} />
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          style={{
                            width: 30, height: 30, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.4)", textDecoration: "none",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(20,184,166,0.3)"; e.currentTarget.style.color = "#14b8a6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          style={{
                            width: 30, height: 30, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
                            color: "rgba(239,68,68,0.5)", cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; }}
                          title="Delete"
                        >
                          {deletingId === product.id ? (
                            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}
