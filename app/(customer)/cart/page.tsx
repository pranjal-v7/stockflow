"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/CountdownTimer";
import { Package, MapPin, Trash2, CheckCircle } from "lucide-react";

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
  const [message, setMessage] = useState("");

  const fetchReservations = () => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((data) => { setReservations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleRelease = async (id: string) => {
    await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    const data = await res.json();

    if (res.status === 410) {
      setMessage("⚠️ This reservation expired. Stock has been released.");
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } else if (res.ok) {
      setMessage("✅ Order confirmed! Redirecting to orders...");
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setTimeout(() => router.push(`/customer/orders/${data.id}`), 1500);
    } else {
      setMessage(data.error || "Confirmation failed");
    }
    setConfirming(null);
  };

  const total = reservations.reduce((sum, r) => sum + r.product.price * r.qty, 0);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-800 rounded-xl w-36" />
      <div className="h-48 bg-slate-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Cart</h1>
        <p className="text-slate-400 mt-1">Complete your reservation before the timer runs out</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 text-sm">{message}</div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 border border-slate-700/50 rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Your cart is empty</p>
          <p className="text-slate-500 text-sm mt-1">Reserve products to see them here</p>
          <button onClick={() => router.push("/customer/products")} className="mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium rounded-xl transition-all">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              {/* Product info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{r.product.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{r.product.sku}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {r.warehouse.name} · {r.warehouse.location}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold">₹{(r.product.price * r.qty).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">₹{r.product.price} × {r.qty}</p>
                </div>
              </div>

              {/* Countdown */}
              <CountdownTimer
                expiresAt={r.expiresAt}
                reservationId={r.id}
                onExpired={() => setReservations((prev) => prev.filter((x) => x.id !== r.id))}
              />

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  id={`confirm-${r.id}`}
                  onClick={() => handleConfirm(r.id)}
                  disabled={confirming === r.id}
                  className="flex-1 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {confirming === r.id ? "Confirming..." : "Confirm Order"}
                </button>
                <button
                  id={`release-${r.id}`}
                  onClick={() => handleRelease(r.id)}
                  className="p-2.5 bg-slate-700 hover:bg-red-500/20 hover:border-red-500/30 border border-slate-600/50 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{reservations.length} item{reservations.length !== 1 ? "s" : ""} reserved</p>
              <p className="text-white font-bold text-xl mt-0.5">₹{total.toLocaleString()}</p>
            </div>
            <div className="text-xs text-slate-500 text-right">
              <p>Prices inclusive of all taxes</p>
              <p className="mt-0.5">Confirm each item individually</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
