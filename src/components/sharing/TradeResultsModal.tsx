import {
  getCompactDisplayCode,
  getCompactEmoji,
  getCompactGroupKey,
  getCompactStickerNumber,
} from "../../features/stickers/exportStickerList";
import type { TradeMatch } from "../../types/tradeMatch";
import { Button } from "../ui/Button";

type TradeResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  friendShareCode?: string | null;
  friendCanGiveMe: TradeMatch[];
  iCanGiveFriend: TradeMatch[];
};

type CompactTradeMatchGroup = {
  groupKey: string;
  displayCode: string;
  emoji: string;
  numbers: string[];
};

function buildCompactTradeMatchGroups(matches: TradeMatch[]): CompactTradeMatchGroup[] {
  const groups: CompactTradeMatchGroup[] = [];
  const groupIndexes = new Map<string, number>();

  matches.forEach((match) => {
    const groupKey = getCompactGroupKey(match.sticker.number);
    const existingGroupIndex = groupIndexes.get(groupKey);
    const number = getCompactStickerNumber(match.sticker.number);

    if (existingGroupIndex === undefined) {
      groupIndexes.set(groupKey, groups.length);
      groups.push({
        groupKey,
        displayCode: getCompactDisplayCode(groupKey),
        emoji: getCompactEmoji(groupKey),
        numbers: [number],
      });
      return;
    }

    groups[existingGroupIndex].numbers.push(number);
  });

  return groups;
}

function TradeMatchGroups({ matches }: { matches: TradeMatch[] }) {
  const groups = buildCompactTradeMatchGroups(matches);

  if (groups.length === 0) {
    return <p className="text-sm text-slate-600">No matches found.</p>;
  }

  return (
    <div className="space-y-1 text-sm text-slate-700">
      {groups.map((group) => (
        <p key={group.groupKey}>
          <span className="font-semibold text-slate-900">
            {group.displayCode}
            {group.emoji ? ` ${group.emoji}` : ""}:
          </span>{" "}
          {group.numbers.join(", ")}
        </p>
      ))}
    </div>
  );
}

export function TradeResultsModal({
  isOpen,
  onClose,
  friendShareCode,
  friendCanGiveMe,
  iCanGiveFriend,
}: TradeResultsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="flex max-h-full w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Trade match results</h2>
            {friendShareCode ? <p className="mt-1 break-all text-xs text-slate-500">Friend code: {friendShareCode}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close trade results modal"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg bg-slate-50 p-3">
              <h3 className="font-semibold text-slate-900">Your friend can give you</h3>
              <div className="mt-2">
                <TradeMatchGroups matches={friendCanGiveMe} />
              </div>
            </section>

            <section className="rounded-lg bg-slate-50 p-3">
              <h3 className="font-semibold text-slate-900">You can give your friend</h3>
              <div className="mt-2">
                <TradeMatchGroups matches={iCanGiveFriend} />
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-5 sm:p-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
