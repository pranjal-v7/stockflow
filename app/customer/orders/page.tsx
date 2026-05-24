"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, Clock } from "lucide-react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string };
  };
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PACKED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  SHIPPED: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  DELIVERED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse border border-slate-700/50" />)}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="text-slate-400 mt-1">Track your confirmed orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 border border-slate-700/50 rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`} className="flex items-center gap-4 bg-slate-800 border border-slate-700/50 hover:border-violet-500/40 rounded-2xl p-4 transition-all group">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{order.reservation.product.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  <span>· Qty {order.reservation.qty}</span>
                  <span>· ₹{(order.reservation.product.price * order.reservation.qty).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>{order.status}</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
