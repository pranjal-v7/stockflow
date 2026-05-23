"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Package } from "lucide-react";

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
  totalStock: number;
  totalUnits: number;
  reservedUnits: number;
  stockEntries: StockEntry[];
}

function StockBadge({ available }: { available: number }) {
  if (available === 0) return <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">Out of Stock</span>;
  if (available <= 10) return <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">Low Stock · {available}</span>;
  return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">In Stock · {available}</span>;
}

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const warehouses = ["All", ...Array.from(new Set(products.flatMap((p) => p.stockEntries.map((s) => s.warehouse.name))))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    const matchWh = warehouseFilter === "All" || p.stockEntries.some((s) => s.warehouse.name === warehouseFilter);
    return matchSearch && matchCat && matchWh;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Browse Products</h1>
        <p className="text-slate-400 mt-1">Discover and reserve health supplements</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="search-products"
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none cursor-pointer"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none cursor-pointer"
          >
            {warehouses.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-2xl h-64 animate-pulse border border-slate-700/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/customer/products/${product.id}`}
              id={`product-${product.id}`}
              className="group bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-violet-500/10"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{product.sku}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3 px-2 py-1 bg-slate-700/50 rounded-lg inline-block">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">₹{product.price}</span>
                  <StockBadge available={product.totalStock} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
