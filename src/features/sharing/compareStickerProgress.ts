import type { SharedStickerProgress } from "../../types/sharedProgress";
import type { Sticker } from "../../types/sticker";
import type { TradeComparisonResult, TradeMatch } from "../../types/tradeMatch";
import type { UserStickerProgress } from "../../types/userProgress";

function getRepeatedCount(progress: { repeated?: boolean; repeated_count?: number } | undefined): number {
  return progress?.repeated_count ?? (progress?.repeated ? 1 : 0);
}

export function compareStickerProgress(input: {
  stickers: Sticker[];
  myProgressByStickerNumber: Record<string, UserStickerProgress>;
  friendProgress: SharedStickerProgress[];
}): TradeComparisonResult {
  const friendProgressByStickerNumber = input.friendProgress.reduce<Record<string, SharedStickerProgress>>(
    (map, row) => {
      map[row.sticker_number] = row;
      return map;
    },
    {},
  );
  const friendCanGiveMe: TradeMatch[] = [];
  const iCanGiveFriend: TradeMatch[] = [];

  input.stickers.forEach((sticker) => {
    const myProgress = input.myProgressByStickerNumber[sticker.number];
    const friendProgress = friendProgressByStickerNumber[sticker.number];
    const friendRepeatedCount = getRepeatedCount(friendProgress);
    const myRepeatedCount = getRepeatedCount(myProgress);

    if (myProgress?.owned !== true && friendRepeatedCount > 0) {
      friendCanGiveMe.push({ sticker, repeatedCount: friendRepeatedCount });
    }

    if (friendProgress?.owned !== true && myRepeatedCount > 0) {
      iCanGiveFriend.push({ sticker, repeatedCount: myRepeatedCount });
    }
  });

  return {
    friendCanGiveMe,
    iCanGiveFriend,
  };
}

export function groupTradeMatchesByTeam(matches: TradeMatch[]): Record<string, TradeMatch[]> {
  return matches.reduce<Record<string, TradeMatch[]>>((groups, match) => {
    groups[match.sticker.team] = groups[match.sticker.team] ?? [];
    groups[match.sticker.team].push(match);
    return groups;
  }, {});
}
