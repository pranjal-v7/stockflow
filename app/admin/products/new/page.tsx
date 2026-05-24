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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white">Add New Product</h2>
          <p className="text-sm text-slate-400 mt-0.5">Fill in the details to add a product to your catalog</p>
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="product-name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Omega-3 Fish Oil 1000mg"
            className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition"
          />
        </div>

        {/* SKU + Category row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              SKU <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="sku"
              id="product-sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="e.g. OMEGA-1000-60"
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              name="category"
              id="product-category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Price (₹) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
            <input
              type="number"
              name="price"
              id="product-price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            name="description"
            id="product-description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Short description of the product..."
            className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            id="submit-product"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Product
              </>
            )}
          </button>
          <Link
            href="/admin/products"
            className="px-5 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
