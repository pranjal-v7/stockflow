"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Supplements",
  "Vitamins",
  "Minerals",
  "Protein",
  "Wellness",
  "Equipment",
  "Diagnostics",
  "Pharmaceuticals",
  "Other",
];

interface FormData {
  name: string;
  sku: string;
  description: string;
  price: string;
  category: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "",
    sku: "",
    description: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price) {
      setError("Name, SKU, and Price are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create product");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Link
          href="/admin/products"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#9d96b0",
            transition: "all 0.2s"
          }}
          className="hover:text-white hover:bg-white/5"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8e4f0", letterSpacing: "-0.02em", marginBottom: 2 }}>Add New Product</h1>
          <p style={{ fontSize: "0.8125rem", color: "#5c5675" }}>Fill in the details to add a product to your catalog</p>
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Error */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 14,
            borderRadius: 10,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <svg width="16" height="16" className="text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: "0.8125rem", color: "#f87171" }}>{error}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="form-label">
            Product Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            id="product-name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Omega-3 Fish Oil 1000mg"
            className="form-input"
          />
        </div>

        {/* SKU + Category row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="form-label">
              SKU <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="sku"
              id="product-sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="e.g. OMEGA-1000-60"
              className="form-input"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div>
            <label className="form-label">
              Category
            </label>
            <div style={{ position: "relative" }}>
              <select
                name="category"
                id="product-category"
                value={form.category}
                onChange={handleChange}
                className="form-input form-select"
                style={{ width: "100%" }}
              >
                <option value="" style={{ background: "#0d0d18" }}>Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: "#0d0d18" }}>
                    {cat}
                  </option>
                ))}
              </select>
              <div style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#5c5675"
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="form-label">
            Price (₹) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#5c5675",
              fontSize: "0.875rem",
              fontWeight: 500
            }}>₹</span>
            <input
              type="number"
              name="price"
              id="product-price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="form-input"
              style={{ paddingLeft: 28 }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="form-label">
            Description
          </label>
          <textarea
            name="description"
            id="product-description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Short description of the product..."
            className="form-input"
            style={{ resize: "none" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            id="submit-product"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                Creating...
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Product
              </>
            )}
          </button>
          <Link
            href="/admin/products"
            className="btn-secondary"
            style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
