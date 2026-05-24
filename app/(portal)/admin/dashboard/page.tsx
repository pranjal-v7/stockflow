"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlowLine from "@/components/ui/GlowLine";
import MetricNumber from "@/components/ui/MetricNumber";
import {
  Activity,
  AlertTriangle,
  RefreshCcw,
  Package,
  Layers,
  CheckCircle,
} from "lucide-react";

interface Metrics {
  activeReservations: number;
  expiredLast1h: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalWarehouses: number;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  outOfStockItems: number;
  lowStockItems: Array<{
    productName: string;
    warehouseName: string;
    available: number;
    total: number;
  }>;
  timestamp: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; glow: "teal" | "amber" | "white" }> = {
  PENDING:   { label: "Pending",   color: "#f59e0b", glow: "amber" },
  CONFIRMED: { label: "Confirmed", color: "#14b8a6", glow: "teal" },
  SHIPPED:   { label: "Shipped",   color: "#60a5fa", glow: "white" },
  DELIVERED: { label: "Delivered", color: "#34d399", glow: "white" },
  CANCELLED: { label: "Cancelled", color: "#ef4444", glow: "white" },
};

function StockRatioBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const color = pct > 50 ? "teal" : pct > 20 ? "amber" : "white";
  return (
    <div>
      <GlowLine value={pct} color={color} />
      <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        <span>{available.toLocaleString()} avail</span>
        <span>{total.toLocaleString()} total</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (!data.error) {
        setMetrics(data);
        setLastRefreshed(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass"
            style={{
              height: 140,
              borderRadius: 8,
              animation: "glow-pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <AlertTriangle size={32} color="#f59e0b" style={{ margin: "0 auto 12px" }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
          Could not load metrics. Ensure you are authenticated as Admin.
        </p>
      </div>
    );
  }

  const totalOrdersForCalc = Object.values(metrics.ordersByStatus).reduce((a, b) => a + b, 0) || 1;
  const stockPct = metrics.totalUnits > 0
    ? (metrics.availableUnits / metrics.totalUnits) * 100
    : 0;

  return (
    <div>
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              Command Center
            </h1>
            <p
              className="font-mono-custom"
              style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}
            >
              SYSTEM TELEMETRY ·{" "}
              <span style={{ color: "rgba(20,184,166,0.8)" }}>
                {lastRefreshed.toLocaleTimeString()}
              </span>
            </p>
          </div>

          <button
            onClick={fetchMetrics}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(20,184,166,0.3)";
              e.currentTarget.style.color = "#14b8a6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <RefreshCcw
              size={12}
              style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}
            />
            Refresh
          </button>
        </div>

        {/* Thin divider with glow */}
        <div
          style={{
            marginTop: 20,
            height: 1,
            background: "linear-gradient(90deg, rgba(20,184,166,0.4) 0%, rgba(255,255,255,0.06) 40%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ── Top metric cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <GlassCard title="Active Reservations" accent="teal" delay={0.05}>
          <MetricNumber value={metrics.activeReservations} label="Currently Reserved" accent="teal" />
        </GlassCard>

        <GlassCard title="Total Inventory Units" accent="amber" delay={0.1}>
          <MetricNumber value={metrics.totalUnits} label="Across All Warehouses" accent="amber" />
        </GlassCard>

        <GlassCard title="Available Units" accent="white" delay={0.15}>
          <MetricNumber value={metrics.availableUnits} label="Ready to Reserve" accent="white" />
        </GlassCard>
      </div>

      {/* ── Secondary metrics ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Total Orders", value: metrics.totalOrders, icon: <Activity size={12} />, color: "#14b8a6" },
          { label: "Products", value: metrics.totalProducts, icon: <Package size={12} />, color: "#f59e0b" },
          { label: "Warehouses", value: metrics.totalWarehouses, icon: <Layers size={12} />, color: "#60a5fa" },
          { label: "Low Stock SKUs", value: metrics.lowStockItems.length, icon: <AlertTriangle size={12} />, color: metrics.lowStockItems.length > 0 ? "#ef4444" : "#34d399" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
            className="glass"
            style={{
              padding: "16px 18px",
              borderRadius: 8,
              borderTop: `1px solid ${item.color}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: item.color }}>
              {item.icon}
              <span className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                {item.label}
              </span>
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: item.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {item.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Orders pipeline + Stock ratio ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Orders by Status — horizontal pipeline */}
        <GlassCard title="Orders Pipeline" accent="teal" delay={0.3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count = metrics.ordersByStatus[status] || 0;
              const pct = (count / totalOrdersForCalc) * 100;
              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: cfg.color, letterSpacing: "0.04em", fontWeight: 600 }}>
                      {cfg.label}
                    </span>
                    <span className="font-mono-custom" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                      {count}
                    </span>
                  </div>
                  <GlowLine value={pct} color={cfg.glow} />
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Stock health */}
        <GlassCard title="Stock Health" accent="amber" delay={0.35}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Available Ratio</span>
                <span className="font-mono-custom" style={{ fontSize: 11, color: "#14b8a6" }}>
                  {stockPct.toFixed(1)}%
                </span>
              </div>
              <GlowLine value={stockPct} color="teal" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Reserved</span>
                <span className="font-mono-custom" style={{ fontSize: 11, color: "#f59e0b" }}>
                  {metrics.totalUnits > 0 ? ((metrics.reservedUnits / metrics.totalUnits) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <GlowLine value={metrics.totalUnits > 0 ? (metrics.reservedUnits / metrics.totalUnits) * 100 : 0} color="amber" />
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <CheckCircle size={14} color={metrics.outOfStockItems === 0 ? "#34d399" : "#ef4444"} />
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
                  {metrics.outOfStockItems === 0
                    ? "All SKUs have stock available"
                    : `${metrics.outOfStockItems} SKUs are out of stock`}
                </p>
                <p className="font-mono-custom" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                  OUT-OF-STOCK INDEX
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Low Stock Alerts — floating rows ── */}
      {metrics.lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span
              className="font-mono-custom"
              style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}
            >
              Low Stock Alerts
            </span>
            <span
              className="font-mono-custom"
              style={{
                fontSize: 9,
                padding: "2px 8px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 4,
                color: "#f59e0b",
              }}
            >
              {metrics.lowStockItems.length}
            </span>
          </div>

          {/* Floating rows — no boxes, just dividers */}
          <div>
            {metrics.lowStockItems.map((item, idx) => (
              <motion.div
                key={`${item.productName}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + idx * 0.04, duration: 0.35 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>
                    {item.productName}
                  </p>
                  <p className="font-mono-custom" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {item.warehouseName}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 100 }}>
                    <StockRatioBar available={item.available} total={item.total} />
                  </div>
                  <span
                    className="font-mono-custom"
                    style={{
                      fontSize: 11,
                      color: item.available === 0 ? "#ef4444" : "#f59e0b",
                      width: 60,
                      textAlign: "right",
                    }}
                  >
                    {item.available} / {item.total}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
