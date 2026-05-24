"use client";

import { useEffect, useRef, useState } from "react";

interface GlowLineProps {
  value: number; // 0–100
  color?: "teal" | "amber" | "white";
  animated?: boolean;
}

export default function GlowLine({
  value,
  color = "teal",
  animated = true,
}: GlowLineProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const fillClass =
    color === "teal"
      ? "glow-fill-teal"
      : color === "amber"
      ? "glow-fill-amber"
      : "glow-fill-white";

  return (
    <div className="glow-track">
      <div
        className={fillClass}
        style={{ width: animated ? `${width}%` : `${value}%` }}
      />
    </div>
  );
}
