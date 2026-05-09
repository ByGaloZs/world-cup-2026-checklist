import { Card } from "../ui/Card";

type StickerStatsProps = {
  total: number;
  owned: number;
  repeated: number;
};

export function StickerStats({ total, owned, repeated }: StickerStatsProps) {
  const missing = Math.max(total - owned, 0);
  const percentage = total > 0 ? ((owned / total) * 100).toFixed(1) : "0.0";
  const stats = [
    { label: "Total", value: total },
    { label: "Owned", value: owned },
    { label: "Repeated", value: repeated },
    { label: "Missing", value: missing },
    { label: "Complete", value: `${percentage}%` },
  ];

  return (
    <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p>
        </div>
      ))}
    </Card>
  );
}
