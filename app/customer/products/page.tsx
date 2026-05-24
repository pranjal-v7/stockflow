"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Tag, DollarSign } from "lucide-react";

interface StockEntry {
  id: string;
  warehouseId: string;
  totalUnits: number;
  reservedUnits: number;
  warehouse: { id: string; name: string };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category?: string;
  description?: string;
  stockEntries: StockEntry[];
}

function getAvailable(product: Product): number {
  return product.stockEntries.reduce(
    (sum, e) => sum + Math.max(0, e.totalUnits - e.reservedUnits),
    0
  );
}

function getTotal(product: Product): number {
  return product.stockEntries.reduce((sum, e) => sum + e.totalUnits, 0);
}

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 36 }}
      >
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            marginBottom: 8,
          }}
        >
          Inventory Browse
        </h1>
        <p
          className="font-mono-custom"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}
        >
          {filtered.length} PRODUCTS AVAILABLE
        </p>
        <div
          style={{
            marginTop: 16,
            height: 1,
            background: "linear-gradient(90deg, rgba(20,184,166,0.4) 0%, rgba(255,255,255,0.06) 40%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ display: "flex", gap: 12, marginBottom: 36, alignItems: "center" }}
      >
        {/* Search box */}
        <div
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 8,
            flex: 1,
          }}
        >
          <Search size={14} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
              fontSize: 13,
            }}
          />
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.15s",
                background: category === cat ? "rgba(20,184,166,0.25)" : "rgba(0,0,0,0.6)",
                borderColor: category === cat ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.15)",
                color: category === cat ? "#14b8a6" : "rgba(255,255,255,0.5)",
                fontFamily: "inherit",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product grid — floating items */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass"
              style={{ height: 180, borderRadius: 10, animation: "glow-pulse 1.5s ease-in-out infinite" }}
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((product, idx) => {
              const available = getAvailable(product);
              const total = getTotal(product);
              const inStock = available > 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03, duration: 0.4 }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  className="product-float"
                  style={{
                    position: "relative",
                    borderRadius: 10,
                    padding: 24,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    cursor: "pointer",
                  }}
                >
                  {/* Hover glow overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      inset: -1,
                      borderRadius: 10,
                      border: "1px solid rgba(20,184,166,0.25)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Category tag */}
                  {product.category && (
                    <span
                      className="font-mono-custom"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(20,184,166,0.6)",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      {product.category}
                    </span>
                  )}

                  {/* Product name */}
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: 4,
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* SKU */}
                  <p
                    className="font-mono-custom"
                    style={{ fontSize: 10, color: "rgba(20,184,166,0.7)", marginBottom: 12 }}
                  >
                    {product.sku}
                  </p>

                  {/* Description */}
                  {product.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        lineHeight: 1.5,
                        marginBottom: 16,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  {/* Price + Stock row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 14,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "#f59e0b",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{product.price.toLocaleString()}
                    </span>

                    <span
                      className="font-mono-custom"
                      style={{
                        fontSize: 10,
                        padding: "3px 10px",
                        borderRadius: 4,
                        background: inStock ? "rgba(20,184,166,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${inStock ? "rgba(20,184,166,0.2)" : "rgba(239,68,68,0.2)"}`,
                        color: inStock ? "#14b8a6" : "#ef4444",
                      }}
                    >
                      {inStock ? `${available} avail` : "Out of stock"}
                    </span>
                  </div>

                  {/* Reserve button */}
                  {inStock && (
                    <Link
                      href={`/customer/products/${product.id}`}
                      style={{
                        display: "block",
                        marginTop: 14,
                        padding: "9px",
                        textAlign: "center",
                        borderRadius: 6,
                        background: "rgba(20,184,166,0.1)",
                        border: "1px solid rgba(20,184,166,0.2)",
                        color: "#14b8a6",
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                        letterSpacing: "0.04em",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(20,184,166,0.2)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(20,184,166,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(20,184,166,0.1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Reserve →
                    </Link>
                  )}
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ gridColumn: "1 / -1", textAlign: "center", paddingTop: 60 }}
              >
                <Package size={32} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No products found</p>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
