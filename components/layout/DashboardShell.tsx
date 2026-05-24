"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AnimatedBackground from "@/components/canvas/AnimatedBackground";

interface DashboardShellProps {
  children: ReactNode;
  role?: string;
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "transparent", position: "relative" }}>
      {/* Layer 1 — Animated Drift Background */}
      <AnimatedBackground />

      {/* Layer 2 — UI Shell */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <Sidebar role={role} />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "40px 48px",
            maxHeight: "100vh",
            background: "transparent",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
