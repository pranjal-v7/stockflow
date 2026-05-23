interface StockBadgeProps {
  available: number;
  total: number;
}

export default function StockBadge({ available, total }: StockBadgeProps) {
  let colorClass: string;
  let label: string;
  let dotClass: string;

  if (available === 0) {
    colorClass = "bg-red-500/10 text-red-400 border-red-500/30";
    dotClass = "bg-red-400";
    label = "Out of Stock";
  } else if (available <= 10) {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    dotClass = "bg-amber-400";
    label = "Low Stock";
  } else {
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    dotClass = "bg-emerald-400";
    label = "In Stock";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
      <span className="text-xs text-slate-500">
        {available.toLocaleString()} / {total.toLocaleString()} units
      </span>
    </div>
  );
}
