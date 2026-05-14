import { Checkbox } from "../ui/Checkbox";
import { Card } from "../ui/Card";
import type { Sticker } from "../../types/sticker";

type StickerCardProps = {
  sticker: Sticker;
  owned: boolean;
  repeated: boolean;
  repeatedCount: number;
  onChange: (patch: { owned?: boolean; repeated?: boolean; repeated_count?: number }) => void;
};

export function StickerCard({ sticker, owned, repeated, repeatedCount, onChange }: StickerCardProps) {
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
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox label="Owned" checked={owned} onChange={(event) => onChange({ owned: event.target.checked })} />
          <div className="flex items-center gap-2">
            <Checkbox label="Repeated" checked={repeated} onChange={(event) => onChange({ repeated: event.target.checked })} />
            {repeated ? (
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => onChange({ repeated_count: Math.max(repeatedCount - 1, 0) })}
                  disabled={repeatedCount === 0}
                  className="px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  aria-label={`Decrease repeated count for ${sticker.number}`}
                >
                  -
                </button>
                <span className="min-w-10 border-x border-slate-200 px-3 py-2 text-center text-sm font-bold text-slate-950">{repeatedCount}</span>
                <button
                  type="button"
                  onClick={() => onChange({ repeated_count: repeatedCount + 1 })}
                  className="px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  aria-label={`Increase repeated count for ${sticker.number}`}
                >
                  +
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
