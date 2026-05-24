"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, MapPin } from "lucide-react";

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

  const handleReserve = async () => {
    if (!session) { router.push("/login"); return; }
    if (!selectedWarehouse) { setError("Please select a warehouse"); return; }
    if (qty > available) { setError("Not enough stock available"); return; }

    setReserving(true);
    setError("");

    const idempotencyKey = `res-${Date.now()}`;
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ productId: product!.id, warehouseId: selectedWarehouse, qty }),
    });

    const data = await res.json();

    if (res.status === 409) { setError("Stock just ran out — please try a different warehouse."); setReserving(false); return; }
    if (!res.ok) { setError(data.error || "Reservation failed"); setReserving(false); return; }

    router.push("/customer/cart");
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-800 rounded-xl w-48" />
      <div className="h-64 bg-slate-800 rounded-2xl" />
    </div>
  );

  if (!product) return <div className="text-slate-400 text-center py-20">Product not found</div>;

  return (
    <div className="max-w-4xl">
      <Link href="/customer/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl h-72 lg:h-96 flex items-center justify-center">
          <div className="w-24 h-24 bg-violet-500/20 rounded-2xl flex items-center justify-center">
            <Package className="w-12 h-12 text-violet-400" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs text-slate-500 font-mono">{product.sku}</span>
            <h1 className="text-2xl font-bold text-white mt-1">{product.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-full text-xs font-medium">{product.category}</span>
          </div>

          {product.description && <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>}
          <div className="text-3xl font-bold text-white">₹{product.price}</div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Select Warehouse
            </label>
            <div className="space-y-2">
              {product.stockEntries.map((s) => {
                const avail = s.totalUnits - s.reservedUnits;
                return (
                  <button
                    key={s.warehouseId}
                    id={`wh-${s.warehouseId}`}
                    onClick={() => { setSelectedWarehouse(s.warehouseId); setError(""); }}
                    disabled={avail === 0}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      selectedWarehouse === s.warehouseId
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                        : avail === 0
                        ? "border-slate-700/30 bg-slate-800/50 text-slate-600 cursor-not-allowed"
                        : "border-slate-700/50 bg-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{s.warehouse.name}</p>
                      <p className="text-xs opacity-70">{s.warehouse.location}</p>
                    </div>
                    <span className={`text-xs font-medium ${avail === 0 ? "text-red-500" : avail <= 10 ? "text-amber-400" : "text-emerald-400"}`}>
                      {avail === 0 ? "Out of stock" : `${avail} available`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button id="qty-minus" onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center text-white transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{qty}</span>
              <button id="qty-plus" onClick={() => setQty(Math.min(available, qty + 1))} className="w-9 h-9 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-500">{available > 0 ? `of ${available} available` : ""}</span>
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

          <button
            id="reserve-btn"
            onClick={handleReserve}
            disabled={reserving || available === 0}
            className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {reserving ? "Reserving..." : available === 0 ? "Out of Stock" : "Reserve Now"}
          </button>
          <p className="text-xs text-slate-500 text-center">Reserved items are held for 15 minutes.</p>
        </div>
      </div>
    </div>
  );
}
