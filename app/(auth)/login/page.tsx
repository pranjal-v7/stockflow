"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, Shield, ShoppingCart, Warehouse, Truck, ArrowRight } from "lucide-react";
import AnimatedBackground from "@/components/canvas/AnimatedBackground";

const PORTALS = [
  {
    role: "ADMIN",
    label: "Admin",
    sublabel: "Command Center",
    desc: "Full system oversight. Manage products, warehouses, orders, and live telemetry.",
    icon: Shield,
    color: "#14b8a6",
    glow: "rgba(20,184,166,0.18)",
    border: "rgba(20,184,166,0.25)",
    href: "/admin/dashboard",
    email: "admin@allohealth.com",
    password: "password123",
  },
  {
    role: "CUSTOMER",
    label: "Customer",
    sublabel: "Procurement Portal",
    desc: "Browse inventory, reserve products, and track your orders end-to-end.",
    icon: ShoppingCart,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.25)",
    href: "/customer/products",
    email: "customer@allohealth.com",
    password: "password123",
  },
  {
    role: "WAREHOUSE_MANAGER",
    label: "Warehouse",
    sublabel: "Stock Manager",
    desc: "Monitor and update stock levels, process fulfillment, and manage warehouse orders.",
    icon: Warehouse,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.25)",
    href: "/warehouse/stock",
    email: "warehouse@allohealth.com",
    password: "password123",
  },
  {
    role: "DELIVERY_AGENT",
    label: "Delivery",
    sublabel: "Dispatch Hub",
    desc: "View assigned routes, track active shipments, and confirm order deliveries.",
    icon: Truck,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.25)",
    href: "/delivery/orders",
    email: "delivery@allohealth.com",
    password: "password123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSelect = async (portal: (typeof PORTALS)[0]) => {
    setLoadingRole(portal.role);
    setError("");

    const result = await signIn("credentials", {
      email: portal.email,
      password: portal.password,
      redirect: false,
    });

    if (result?.error) {
      setError(`Could not sign in as ${portal.label}. Check that the database is seeded.`);
      setLoadingRole(null);
      return;
    }

    router.push(portal.href);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        overflowX: "hidden",
      }}
    >
      {/* Layer 1 — Animated Drift Background */}
      <AnimatedBackground />

      {/* Layer 2 — Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 900 }}>
        {/* ── Logo / Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(20,184,166,0.08)",
              border: "1px solid rgba(20,184,166,0.2)",
              marginBottom: 20,
              boxShadow: "0 0 40px rgba(20,184,166,0.12)",
            }}
          >
            <Hexagon size={26} color="#14b8a6" />
          </div>

          <h1
            className="font-mono-custom"
            style={{
              fontSize: 12,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            StockFlow
          </h1>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Choose your portal
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Select a role to enter the corresponding command interface.
          </p>
        </motion.div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                maxWidth: 560,
                margin: "0 auto 24px",
                padding: "12px 16px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                fontSize: 13,
                color: "#f87171",
                textAlign: "center",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Portal cards grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {PORTALS.map((portal, idx) => {
            const Icon = portal.icon;
            const isLoading = loadingRole === portal.role;
            const isDisabled = loadingRole !== null && !isLoading;

            return (
              <motion.button
                key={portal.role}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleSelect(portal)}
                disabled={loadingRole !== null}
                whileHover={!loadingRole ? { y: -4, transition: { duration: 0.2 } } : {}}
                whileTap={!loadingRole ? { scale: 0.98 } : {}}
                style={{
                  position: "relative",
                  padding: "32px 24px",
                  background: isLoading
                    ? `${portal.glow.replace("0.15", "0.1")}`
                    : "rgba(0,0,0,0.75)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${isLoading ? portal.border : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 12,
                  cursor: loadingRole !== null ? "default" : "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  opacity: isDisabled ? 0.4 : 1,
                  transition: "opacity 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s",
                  boxShadow: isLoading
                    ? `0 0 40px ${portal.glow}, 0 0 80px ${portal.glow.replace("0.15", "0.06")}`
                    : "none",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (loadingRole) return;
                  e.currentTarget.style.borderColor = portal.border;
                  e.currentTarget.style.background = portal.glow.replace("0.15", "0.65");
                  e.currentTarget.style.boxShadow = `0 0 40px ${portal.glow.replace("0.15", "0.1")}`;
                }}
                onMouseLeave={(e) => {
                  if (loadingRole) return;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${portal.color}60, transparent)`,
                    borderRadius: "12px 12px 0 0",
                  }}
                />

                {/* Corner + markers */}
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 10,
                    fontSize: 11,
                    color: `${portal.color}40`,
                    fontFamily: "monospace",
                    lineHeight: 1,
                  }}
                  aria-hidden
                >
                  +
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 10,
                    fontSize: 11,
                    color: `${portal.color}40`,
                    fontFamily: "monospace",
                    lineHeight: 1,
                  }}
                  aria-hidden
                >
                  +
                </span>

                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${portal.color}12`,
                    border: `1px solid ${portal.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  {isLoading ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${portal.color}30`,
                        borderTopColor: portal.color,
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <Icon size={18} color={portal.color} />
                  )}
                </div>

                {/* Labels */}
                <p
                  className="font-mono-custom"
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: portal.color,
                    marginBottom: 4,
                    opacity: 0.8,
                  }}
                >
                  {portal.sublabel}
                </p>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    lineHeight: 1.1,
                  }}
                >
                  {isLoading ? "Entering…" : portal.label}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {portal.desc}
                </p>

                {/* Enter arrow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: portal.color,
                    letterSpacing: "0.04em",
                  }}
                >
                  {isLoading ? "Authenticating" : "Enter portal"}
                  <ArrowRight size={12} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-mono-custom"
          style={{
            textAlign: "center",
            marginTop: 40,
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          STOCKFLOW · ALLO HEALTH · OPERATIONS COMMAND
        </motion.p>
      </div>
    </div>
  );
}
