import type { Sticker } from "../../types/sticker";
import type { UserStickerProgress } from "../../types/userProgress";
import { StickerCard } from "./StickerCard";

type StickerGroupProps = {
  team: string;
  stickers: Sticker[];
  progress: Record<string, UserStickerProgress>;
  onUpdate: (stickerNumber: string, patch: { owned?: boolean; repeated?: boolean }) => void;
};

export function StickerGroup({ team, stickers, progress, onUpdate }: StickerGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-lg font-bold text-slate-950">{team}</h2>
        <span className="text-xs font-medium text-slate-500">{stickers.length} stickers</span>
      </div>
      <div className="space-y-2">
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
    </section>
  );
}
