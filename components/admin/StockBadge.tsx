interface StockBadgeProps {
  available: number;
  total: number;
}

export default function StockBadge({ available, total }: StockBadgeProps) {
  let badgeClass: string;
  let label: string;
  let dotColor: string;

  if (available === 0) {
    badgeClass = "badge badge-red";
    dotColor = "#f87171";
    label = "Out of Stock";
  } else if (available <= 10) {
    badgeClass = "badge badge-amber";
    dotColor = "#fbbf24";
    label = "Low Stock";
  } else {
    badgeClass = "badge badge-green";
    dotColor = "#34d399";
    label = "In Stock";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className={badgeClass}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
        {label}
      </span>
      <span style={{ fontSize: "0.625rem", color: "#5c5675", fontFamily: "var(--font-mono)" }}>
        {available.toLocaleString()} / {total.toLocaleString()} units
      </span>
    </div>
  );
}
