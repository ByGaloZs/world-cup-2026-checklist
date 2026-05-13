import type { Sticker } from "../../types/sticker";
import type { UserStickerProgress } from "../../types/userProgress";
import { StickerCard } from "./StickerCard";

type StickerGroupProps = {
  team: string;
  stickers: Sticker[];
  progress: Record<string, UserStickerProgress>;
  ownedCount: number;
  totalCount: number;
  collapsed: boolean;
  onToggle: () => void;
  onUpdate: (stickerNumber: string, patch: { owned?: boolean; repeated?: boolean }) => void;
};

export function StickerGroup({ team, stickers, progress, ownedCount, totalCount, collapsed, onToggle, onUpdate }: StickerGroupProps) {
  const completionPercentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;
  const completed = totalCount > 0 && ownedCount === totalCount;

  return (
    <section className={`overflow-hidden rounded-xl border ${completed ? "border-green-200 bg-green-50/60" : "border-slate-200 bg-white"}`}>
      <button type="button" onClick={onToggle} aria-expanded={!collapsed} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="text-sm font-bold text-slate-500" aria-hidden="true">
          {collapsed ? "▶" : "▼"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-bold text-slate-950">{team}</h2>
            <span className="text-sm font-semibold text-slate-600">
              {ownedCount}/{totalCount}
            </span>
            <span className="text-sm font-semibold text-slate-600">{completionPercentage}%</span>
            {completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                <span aria-hidden="true">✓</span> Completed
              </span>
            ) : null}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all ${completed ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </button>
      {!collapsed ? (
        <div className="space-y-2 border-t border-slate-200 p-3">
          {stickers.map((sticker) => {
            const stickerProgress = progress[sticker.number];

            return (
              <StickerCard
                key={sticker.number}
                sticker={sticker}
                owned={stickerProgress?.owned ?? false}
                repeated={stickerProgress?.repeated ?? false}
                onChange={(patch) => onUpdate(sticker.number, patch)}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
