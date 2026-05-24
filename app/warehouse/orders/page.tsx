"use client";

import { useEffect, useState } from "react";
import { Package, ChevronRight, User, MapPin } from "lucide-react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  deliveryAgent: { name: string; email: string } | null;
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string; location: string };
  };
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PACKED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  SHIPPED: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  DELIVERED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const nextStatus: Record<string, string> = {
  CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function WarehouseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
    setUpdating(null);
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse border border-slate-700/50" />)}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Order Management</h1>
        <p className="text-slate-400 mt-1">Process and track all orders through the warehouse</p>
      </div>

      {/* Status pipeline summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map((s) => (
          <div key={s} className={`p-3 rounded-xl border text-center ${statusColors[s]}`}>
            <p className="text-xl font-bold">{orders.filter((o) => o.status === s).length}</p>
            <p className="text-xs mt-0.5 capitalize">{s.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 border border-slate-700/50 rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{order.reservation.product.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{order.reservation.product.sku}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.customer.name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.reservation.warehouse.name}</span>
                      <span>Qty: {order.reservation.qty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>{order.status}</span>
                  {nextStatus[order.status] && (
                    <button
                      id={`advance-${order.id}`}
                      disabled={updating === order.id}
                      onClick={() => updateStatus(order.id, nextStatus[order.status])}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      {updating === order.id ? "..." : `Mark ${nextStatus[order.status]}`}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              {order.deliveryAgent && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                  Delivery agent: <span className="text-slate-300">{order.deliveryAgent.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
