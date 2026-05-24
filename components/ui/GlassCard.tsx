"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: "teal" | "amber" | "white" | "none";
  animate?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  title,
  accent = "teal",
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const accentColor =
    accent === "teal"
      ? "rgba(20,184,166,0.6)"
      : accent === "amber"
      ? "rgba(245,158,11,0.6)"
      : "rgba(255,255,255,0.3)";

  const topBorder =
    accent === "teal"
      ? "border-t border-teal-500/40"
      : accent === "amber"
      ? "border-t border-amber-500/40"
      : accent === "white"
      ? "border-t border-white/20"
      : "";

  const Wrapper = animate ? motion.div : "div";
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <Wrapper
      {...(motionProps as object)}
      className={`glass relative rounded-lg overflow-hidden ${topBorder} ${className}`}
    >
      {/* Corner markers — top-left */}
      <span
        className="absolute top-0 left-0 font-mono-custom text-xs select-none pointer-events-none"
        style={{ color: accentColor, lineHeight: 1, padding: "6px 8px", opacity: 0.5 }}
        aria-hidden
      >
        +
      </span>

      {/* Corner markers — bottom-right */}
      <span
        className="absolute bottom-0 right-0 font-mono-custom text-xs select-none pointer-events-none"
        style={{ color: accentColor, lineHeight: 1, padding: "6px 8px", opacity: 0.5 }}
        aria-hidden
      >
        +
      </span>

      {/* Scan line effect on top border */}
      {accent !== "none" && (
        <div
          className="absolute top-0 left-0 w-full h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        {title && (
          <p
            className="font-mono-custom mb-4"
            style={{
              fontSize: "9px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {title}
          </p>
        )}
        {children}
      </div>
    </Wrapper>
  );
}
