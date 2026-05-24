interface StockEntry {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits?: number;
  product?: { id: string; name: string };
}

interface StockPanelProps {
  stockEntries: StockEntry[];
}

export default function StockPanel({ stockEntries }: StockPanelProps) {
  const totalProducts = new Set(stockEntries.map(e => e.product?.id).filter(Boolean)).size;
  const totalUnits = stockEntries.reduce((s, e) => s + e.totalUnits, 0);
  const reservedUnits = stockEntries.reduce((s, e) => s + e.reservedUnits, 0);
  const availableUnits = stockEntries.reduce((s, e) => s + (e.availableUnits ?? e.totalUnits - e.reservedUnits), 0);
  const availPct = totalUnits > 0 ? ((availableUnits / totalUnits) * 100).toFixed(0) : "0";

  const metrics = [
    {
      id: "total-products-metric",
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      sub: "unique SKUs tracked",
      accent: "#7c3aed",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: "total-units-metric",
      label: "Total Units",
      value: totalUnits.toLocaleString(),
      sub: "across all warehouses",
      accent: "#06b6d4",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        </svg>
      ),
    },
    {
      id: "reserved-units-metric",
      label: "Reserved Units",
      value: reservedUnits.toLocaleString(),
      sub: `${availableUnits.toLocaleString()} available (${availPct}%)`,
      accent: "#f59e0b",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {metrics.map(m => (
        <div
          key={m.id}
          id={m.id}
          style={{
            background: `${m.accent}0d`,
            border: `1px solid ${m.accent}25`,
            borderRadius: 14,
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* top accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${m.accent}60, transparent)` }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#5c5675", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{m.label}</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${m.accent}18`, border: `1px solid ${m.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", color: m.accent }}>
              {m.icon}
            </div>
          </div>
          <p style={{ fontSize: "1.875rem", fontWeight: 800, color: m.accent, letterSpacing: "-0.03em", fontFamily: "var(--font-mono)" }}>{m.value}</p>
          <p style={{ fontSize: "0.6875rem", color: "#5c5675", marginTop: 6 }}>{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
