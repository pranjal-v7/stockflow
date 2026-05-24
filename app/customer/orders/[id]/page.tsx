"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CheckCircle, Clock, Truck, PackageCheck } from "lucide-react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deliveryAgent: { name: string } | null;
  reservation: {
    qty: number;
    product: { name: string; sku: string; price: number };
    warehouse: { name: string; location: string };
  };
}

const steps = [
  { key: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
];

export default function CustomerOrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = () => {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((orders: Order[]) => {
          const found = Array.isArray(orders) ? orders.find((o) => o.id === id) : null;
          setOrder(found || null);
          setLoading(false);
        });
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const currentStepIdx = steps.findIndex((s) => s.key === order?.status);

  if (loading) return <div className="h-64 bg-slate-800 rounded-2xl animate-pulse border border-slate-700/50" />;
  if (!order) return <div className="text-center py-20 text-slate-400">Order not found</div>;

  return (
    <div className="max-w-lg">
      <Link href="/customer/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="font-bold text-white">{order.reservation.product.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{order.reservation.product.sku}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {order.reservation.warehouse.name} · {order.reservation.warehouse.location}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-400">Qty</span>
          <span className="text-white font-medium">{order.reservation.qty}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total</span>
          <span className="text-white font-bold">₹{(order.reservation.product.price * order.reservation.qty).toLocaleString()}</span>
        </div>
        {order.deliveryAgent && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1"><Truck className="w-3 h-3" />Delivery agent</span>
            <span className="text-slate-300">{order.deliveryAgent.name}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Live Order Status
        </h2>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400" : "bg-slate-700 border-2 border-slate-600 text-slate-500"} ${isCurrent ? "ring-4 ring-emerald-500/20 scale-110" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDone ? "text-white" : "text-slate-500"}`}>{step.label}</p>
                  {isCurrent && <p className="text-xs text-emerald-400 mt-0.5">Current status</p>}
                </div>
                {isDone && !isCurrent && <span className="text-xs text-emerald-500">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
