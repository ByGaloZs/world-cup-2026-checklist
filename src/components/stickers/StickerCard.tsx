import { Checkbox } from "../ui/Checkbox";
import { Card } from "../ui/Card";
import type { Sticker } from "../../types/sticker";

type StickerCardProps = {
  sticker: Sticker;
  owned: boolean;
  repeated: boolean;
  onChange: (patch: { owned?: boolean; repeated?: boolean }) => void;
};

export function StickerCard({ sticker, owned, repeated, onChange }: StickerCardProps) {
  return (
    <Card className="p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-900">{sticker.number}</span>
            <h3 className="truncate text-sm font-semibold text-slate-950">{sticker.name}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {sticker.team}{sticker.category ? ` · ${sticker.category}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Checkbox label="Owned" checked={owned} onChange={(event) => onChange({ owned: event.target.checked })} />
          <Checkbox label="Repeated" checked={repeated} onChange={(event) => onChange({ repeated: event.target.checked })} />
        </div>
      </div>
    </Card>
  );
}
