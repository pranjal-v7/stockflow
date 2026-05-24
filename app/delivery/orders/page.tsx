"use client";

import { useEffect, useState } from "react";
import { Package, MapPin, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string; location: string };
  };
}

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const markDelivered = async (orderId: string) => {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
    setUpdating(null);
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse border border-slate-700/50" />)}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Deliveries</h1>
        <p className="text-slate-400 mt-1">Orders assigned to you</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-slate-800 border border-slate-700/50 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{orders.filter((o) => o.status === "SHIPPED").length}</p>
          <p className="text-xs text-slate-400 mt-1">Pending Delivery</p>
        </div>
        <div className="p-4 bg-slate-800 border border-slate-700/50 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{orders.filter((o) => o.status === "DELIVERED").length}</p>
          <p className="text-xs text-slate-400 mt-1">Delivered</p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white text-sm">{order.reservation.product.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span>To: <span className="text-slate-300">{order.customer.name}</span></span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.reservation.warehouse.location}</span>
                </div>
              </div>
              {order.status === "SHIPPED" ? (
                <button
                  id={`deliver-${order.id}`}
                  disabled={updating === order.id}
                  onClick={() => markDelivered(order.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {updating === order.id ? "..." : "Mark Delivered"}
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                  {order.status}
                </span>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 bg-slate-800 border border-slate-700/50 rounded-2xl">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No deliveries assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
