"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StockBadge from "@/components/admin/StockBadge";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description?: string;
  stockEntries?: { totalUnits: number; availableUnits: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getTotalStock = (product: Product) =>
    product.stockEntries?.reduce((s, e) => s + e.totalUnits, 0) ?? 0;

  const getAvailableStock = (product: Product) =>
    product.stockEntries?.reduce((s, e) => s + e.availableUnits, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your inventory products and SKUs
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: products.length, color: "emerald" },
          {
            label: "Total Stock Units",
            value: products.reduce((s, p) => s + getTotalStock(p), 0),
            color: "blue",
          },
          {
            label: "Available Units",
            value: products.reduce((s, p) => s + getAvailableStock(p), 0),
            color: "violet",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
          >
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, SKU or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-3 text-xs text-slate-400 hover:text-white underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-400 text-sm">No products found</p>
            <Link href="/admin/products/new" className="text-xs text-emerald-400 hover:underline">
              Add your first product →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {["Name", "SKU", "Category", "Price", "Total Stock", "Available", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((product) => {
                const total = getTotalStock(product);
                const available = getAvailableStock(product);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {product.sku}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-slate-700/50 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">
                      ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{total.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <StockBadge available={available} total={total} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-all disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
                            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-slate-500 text-right">
          Showing {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}
