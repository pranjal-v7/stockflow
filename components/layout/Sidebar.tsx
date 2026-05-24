"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  LogOut,
  Activity,
  Hexagon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: "Command Center", href: "/admin/dashboard", icon: <LayoutDashboard size={14} /> },
  { label: "Products", href: "/admin/products", icon: <Package size={14} /> },
  { label: "Warehouses", href: "/admin/warehouses", icon: <Warehouse size={14} /> },
];

const customerNav: NavItem[] = [
  { label: "Browse Inventory", href: "/customer/products", icon: <Package size={14} /> },
  { label: "Cart", href: "/customer/cart", icon: <ShoppingCart size={14} /> },
  { label: "Orders", href: "/customer/orders", icon: <Activity size={14} /> },
];

const warehouseNav: NavItem[] = [
  { label: "Stock Levels", href: "/warehouse/stock", icon: <Package size={14} /> },
  { label: "Orders", href: "/warehouse/orders", icon: <Activity size={14} /> },
];

const deliveryNav: NavItem[] = [
  { label: "My Deliveries", href: "/delivery/orders", icon: <Truck size={14} /> },
];

function getNavForRole(role?: string): NavItem[] {
  switch (role) {
    case "ADMIN": return adminNav;
    case "CUSTOMER": return customerNav;
    case "WAREHOUSE_MANAGER": return warehouseNav;
    case "DELIVERY_AGENT": return deliveryNav;
    default: return adminNav;
  }
}

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const nav = getNavForRole(role || session?.user?.role as string);

  return (
    <aside
      className="glass-heavy flex flex-col"
      style={{
        width: 220,
        minHeight: "100vh",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Hexagon size={14} color="#14b8a6" />
          </div>
          <div>
            <p
              className="font-mono-custom"
              style={{
                fontSize: "10px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 600,
              }}
            >
              StockFlow
            </p>
            <p
              className="font-mono-custom"
              style={{
                fontSize: "8px",
                letterSpacing: "0.15em",
                color: "rgba(20,184,166,0.7)",
              }}
            >
              {role || session?.user?.role || "SYSTEM"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Section Label */}
      <div style={{ padding: "20px 20px 8px" }}>
        <p
          className="font-mono-custom"
          style={{
            fontSize: "8px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Navigation
        </p>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "0 8px", overflowY: "auto" }}>
        {nav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 6,
                marginBottom: 2,
                fontSize: "12px",
                fontWeight: 500,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                textDecoration: "none",
                position: "relative",
                transition: "color 0.15s, background 0.15s",
                background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                letterSpacing: "0.01em",
              }}
              className={isActive ? "nav-active" : ""}
            >
              <span style={{ color: isActive ? "#14b8a6" : "rgba(255,255,255,0.2)" }}>
                {item.icon}
              </span>
              {item.label}

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    height: "60%",
                    width: 2,
                    background: "linear-gradient(to bottom, #14b8a6, #06b6d4)",
                    borderRadius: "0 2px 2px 0",
                    boxShadow: "0 0 8px rgba(20,184,166,0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live indicator */}
      <div
        style={{
          margin: "0 12px 12px",
          padding: "10px 12px",
          background: "rgba(20,184,166,0.05)",
          border: "1px solid rgba(20,184,166,0.12)",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="animate-glow-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#14b8a6",
              boxShadow: "0 0 6px rgba(20,184,166,0.8)",
              display: "inline-block",
            }}
          />
          <span
            className="font-mono-custom"
            style={{ fontSize: "9px", letterSpacing: "0.15em", color: "#14b8a6" }}
          >
            LIVE SYNC
          </span>
        </div>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
          Real-time inventory
        </p>
      </div>

      {/* User footer */}
      <div
        style={{
          padding: "12px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: 700,
              color: "#14b8a6",
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }}>
              {session?.user?.name || "User"}
            </p>
            <p
              className="font-mono-custom"
              style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}
            >
              {session?.user?.email?.split("@")[0] || "—"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "7px 10px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
