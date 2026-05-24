"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hexagon, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedBackground from "@/components/canvas/AnimatedBackground";

const ROLES = [
  { value: "CUSTOMER",          label: "Customer",   desc: "Browse & reserve",   color: "#f59e0b" },
  { value: "WAREHOUSE_MANAGER", label: "Manager",    desc: "Stock & fulfillment", color: "#14b8a6" },
  { value: "ADMIN",             label: "Admin",      desc: "Full oversight",      color: "#a78bfa" },
  { value: "DELIVERY_AGENT",    label: "Delivery",   desc: "Order dispatch",      color: "#60a5fa" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push("/login?registered=true");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "transparent", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 12, background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", marginBottom: 14, boxShadow: "0 0 30px rgba(20,184,166,0.15)" }}>
            <Hexagon size={24} color="#14b8a6" />
          </div>
          <h1 className="font-mono-custom" style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>StockFlow</h1>
          <p className="font-mono-custom" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Create Account</p>
        </div>

        <GlassCard accent="teal" animate={false}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 4, letterSpacing: "-0.02em" }}>Join StockFlow</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Select your role and create credentials</p>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, fontSize: 12, color: "#f87171", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Role selection */}
            <div>
              <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Identity Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    id={`role-${r.value.toLowerCase()}`}
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 7,
                      background: form.role === r.value ? `${r.color}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${form.role === r.value ? r.color + "40" : "rgba(255,255,255,0.07)"}`,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 700, color: form.role === r.value ? r.color : "rgba(255,255,255,0.6)" }}>{r.label}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>Full Name</label>
              <input id="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe"
                style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ffffff", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(20,184,166,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>Email Address</label>
              <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@allohealth.care"
                style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ffffff", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(20,184,166,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-mono-custom" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>Password</label>
              <input id="reg-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ffffff", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(20,184,166,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 7, background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)", color: "#14b8a6", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(20,184,166,0.1)", marginTop: 4 }}
            >
              {loading ? <div style={{ width: 14, height: 14, border: "2px solid rgba(20,184,166,0.3)", borderTopColor: "#14b8a6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <>Create Account <ArrowRight size={14} /></>}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Have an account?{" "}
              <Link href="/login" style={{ color: "#14b8a6", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
