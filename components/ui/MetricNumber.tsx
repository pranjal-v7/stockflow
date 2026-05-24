"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, animate } from "framer-motion";

interface MetricNumberProps {
  value: number;
  label: string;
  accent?: "teal" | "amber" | "white";
  prefix?: string;
  suffix?: string;
}

export default function MetricNumber({
  value,
  label,
  accent = "teal",
  prefix = "",
  suffix = "",
}: MetricNumberProps) {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = motionVal.on("change", (latest) => {
      if (displayRef.current) {
        displayRef.current.textContent =
          prefix + Math.round(latest).toLocaleString() + suffix;
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionVal, prefix, suffix]);

  const accentColor =
    accent === "teal"
      ? "#14b8a6"
      : accent === "amber"
      ? "#f59e0b"
      : "#ffffff";

  return (
    <div>
      <div
        className="font-bold tracking-tight"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: accentColor, lineHeight: 1 }}
      >
        <span ref={displayRef}>{prefix}0{suffix}</span>
      </div>
      <p
        className="font-mono-custom mt-2"
        style={{
          fontSize: "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </p>
    </div>
  );
}
