"use client";

import Link from "next/link";
import { Hexagon, ArrowRight, Zap, Shield, Truck, Package } from "lucide-react";
import AnimatedBackground from "@/components/canvas/AnimatedBackground";

export default function HomePage() {
  // Always show the landing page; let /login handle role selection
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        color: "#fff",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Layer 1 — Animated Drift Background */}
      <AnimatedBackground />

      {/* ── Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Hexagon size={18} color="#14b8a6" />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              letterSpacing: "0.28em",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            StockFlow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/login"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 6,
              transition: "color 0.2s",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#14b8a6",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 6,
              background: "rgba(20,184,166,0.1)",
              border: "1px solid rgba(20,184,166,0.25)",
              transition: "all 0.2s",
            }}
          >
            Get Access
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            background: "rgba(20,184,166,0.06)",
            border: "1px solid rgba(20,184,166,0.18)",
            borderRadius: 100,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#14b8a6",
              boxShadow: "0 0 6px rgba(20,184,166,0.8)",
              animation: "glow-pulse 2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(20,184,166,0.8)",
            }}
          >
            Production-Grade Inventory OS
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#ffffff",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Inventory
          <br />
          <span
            style={{
              color: "transparent",
              backgroundImage:
                "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            Command
          </span>
          <br />
          Redefined.
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "rgba(255,255,255,0.4)",
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Concurrency-safe reservations. Real-time warehouse telemetry.
          Role-based portals for every node in your supply chain.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 8,
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.3)",
              color: "#14b8a6",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 0 40px rgba(20,184,166,0.12)",
              transition: "all 0.2s",
            }}
          >
            Enter Command Center <ArrowRight size={16} />
          </Link>
          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Create Account
          </Link>
        </div>

        {/* Thin gradient line */}
        <div
          style={{
            marginTop: 80,
            width: "100%",
            maxWidth: 800,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(20,184,166,0.3) 30%, rgba(245,158,11,0.3) 70%, transparent)",
          }}
        />
      </section>

      {/* ── Feature Grid ── */}
      <section
        id="features"
        style={{
          position: "relative",
          zIndex: 10,
          padding: "80px 40px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 1,
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {[
            {
              icon: <Zap size={20} color="#14b8a6" />,
              title: "Redis Reservations",
              desc: "Sub-5ms pessimistic locking prevents overselling under extreme concurrent load.",
              color: "#14b8a6",
            },
            {
              icon: <Shield size={20} color="#f59e0b" />,
              title: "Role-Based Access",
              desc: "Admin, Customer, Warehouse Manager, and Delivery Agent portals with enforced session guards.",
              color: "#f59e0b",
            },
            {
              icon: <Package size={20} color="#a78bfa" />,
              title: "Multi-Warehouse",
              desc: "Distributed stock across warehouses with per-location availability tracking.",
              color: "#a78bfa",
            },
            {
              icon: <Truck size={20} color="#60a5fa" />,
              title: "Fulfillment Pipeline",
              desc: "End-to-end order lifecycle from reservation to confirmed delivery.",
              color: "#60a5fa",
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                padding: "36px 28px",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(20px)",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.6)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.75)")
              }
            >
              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${feature.color}30, transparent)`,
                }}
              />
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          padding: "32px 40px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Hexagon size={14} color="rgba(255,255,255,0.2)" />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            STOCKFLOW · ALLO HEALTH
          </span>
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          © 2026
        </p>
      </footer>
    </div>
  );
}
