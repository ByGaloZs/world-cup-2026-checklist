import type { Sticker } from "./sticker";

export type TradeMatch = {
  sticker: Sticker;
  repeatedCount: number;
};

export type TradeComparisonResult = {
  friendCanGiveMe: TradeMatch[];
  iCanGiveFriend: TradeMatch[];
};
