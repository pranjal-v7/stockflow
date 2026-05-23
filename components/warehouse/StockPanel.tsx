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
  const totalProducts = new Set(stockEntries.map((e) => e.product?.id).filter(Boolean)).size;
  const totalUnits = stockEntries.reduce((s, e) => s + e.totalUnits, 0);
  const reservedUnits = stockEntries.reduce((s, e) => s + e.reservedUnits, 0);
  const availableUnits = stockEntries.reduce(
    (s, e) => s + (e.availableUnits ?? e.totalUnits - e.reservedUnits),
    0
  );

  const metrics = [
    {
      id: "total-products-metric",
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      subtext: "unique SKUs tracked",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradientFrom: "from-violet-500/20",
      gradientTo: "to-violet-600/5",
      borderColor: "border-violet-500/30",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      valueColor: "text-violet-300",
    },
    {
      id: "total-units-metric",
      label: "Total Units",
      value: totalUnits.toLocaleString(),
      subtext: "across all warehouses",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      gradientFrom: "from-emerald-500/20",
      gradientTo: "to-emerald-600/5",
      borderColor: "border-emerald-500/30",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-300",
    },
    {
      id: "reserved-units-metric",
      label: "Reserved Units",
      value: reservedUnits.toLocaleString(),
      subtext: `${availableUnits.toLocaleString()} available`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      gradientFrom: "from-amber-500/20",
      gradientTo: "to-amber-600/5",
      borderColor: "border-amber-500/30",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      valueColor: "text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          id={metric.id}
          className={`relative bg-gradient-to-br ${metric.gradientFrom} ${metric.gradientTo} border ${metric.borderColor} rounded-xl p-5 overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <div className="w-full h-full rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.label}</p>
              <div className={`w-9 h-9 rounded-lg ${metric.iconBg} flex items-center justify-center ${metric.iconColor}`}>
                {metric.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${metric.valueColor} tabular-nums`}>{metric.value}</p>
            <p className="text-xs text-slate-500 mt-1">{metric.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
