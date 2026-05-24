"use client";

import { useEffect, useState } from "react";
import { Package, MapPin, CheckCircle, Navigation, Clock, User } from "lucide-react";

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
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="skeleton" style={{ height: 60, borderRadius: 14 }} />
      <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
      <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
    </div>
  );

  const pendingOrders = orders.filter((o) => o.status === "SHIPPED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8e4f0", letterSpacing: "-0.02em", marginBottom: 4 }}>My Deliveries</h1>
        <p style={{ fontSize: "0.8125rem", color: "#5c5675" }}>Dispatch matrix and active fulfillment routes</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="metric-card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#5c5675", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 6 }}>Pending Dispatch</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.03em" }}>{pendingOrders.length}</p>
        </div>
        <div className="metric-card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#5c5675", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 6 }}>Completed Deliveries</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", letterSpacing: "-0.03em" }}>{completedOrders.length}</p>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((order) => {
          const isPending = order.status === "SHIPPED";
          return (
            <div
              key={order.id}
              className="glass-card"
              style={{
                padding: 20,
                border: isPending ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="sku" style={{ color: "#7c3aed" }}>{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`badge ${isPending ? "badge-amber" : "badge-green"}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#e8e4f0" }}>{order.reservation.product.name}</h3>
                </div>

                {isPending ? (
                  <button
                    id={`deliver-${order.id}`}
                    disabled={updating === order.id}
                    onClick={() => markDelivered(order.id)}
                    className="btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      boxShadow: "0 4px 16px rgba(245,158,11,0.25)",
                      fontSize: "0.75rem",
                      padding: "8px 16px"
                    }}
                  >
                    {updating === order.id ? (
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Delivered
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    <CheckCircle className="w-4 h-4" />
                    DELIVERED
                  </div>
                )}
              </div>

              {/* Grid details */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p style={{ fontSize: "0.625rem", textTransform: "uppercase", color: "#5c5675", margin: 0, fontFamily: "var(--font-mono)" }}>Customer</p>
                    <p style={{ fontSize: "0.8125rem", color: "#9d96b0", margin: 0 }}>{order.customer.name}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p style={{ fontSize: "0.625rem", textTransform: "uppercase", color: "#5c5675", margin: 0, fontFamily: "var(--font-mono)" }}>Warehouse</p>
                    <p style={{ fontSize: "0.8125rem", color: "#9d96b0", margin: 0 }}>
                      {order.reservation.warehouse.name} ({order.reservation.warehouse.location})
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p style={{ fontSize: "0.625rem", textTransform: "uppercase", color: "#5c5675", margin: 0, fontFamily: "var(--font-mono)" }}>Dispatched</p>
                    <p style={{ fontSize: "0.8125rem", color: "#9d96b0", margin: 0 }}>
                      {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
            <Package className="w-10 h-10 text-text-muted" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "#5c5675", fontSize: "0.875rem", margin: 0 }}>No deliveries assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
