import React from "react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-black">
      {/* Animated Image — slow cinematic drift */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/background_stockflow.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover animate-slow-pan opacity-100"
      />

      {/* Light vignette — only darkens the very edges, keeps center bright */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-technical-grid opacity-20" />
    </div>
  );
}
