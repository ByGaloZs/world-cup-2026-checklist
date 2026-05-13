import type { Sticker } from "../../types/sticker";
import type { UserStickerProgress } from "../../types/userProgress";

type BuildStickerExportTextInput = {
  stickers: Sticker[];
  progressByStickerNumber: Record<string, UserStickerProgress>;
};

type CompactStickerGroup = {
  groupKey: string;
  displayCode: string;
  emoji: string;
  numbers: string[];
};

const FOOTER_TEXT = "Track your World Cup 2026 stickers here:\nhttps://world-cup-2026-checklist.vercel.app/";
const STICKER_GROUP_EMOJIS: Record<string, string> = {
  FWC_WORLD: "🌎",
  FWC_HISTORY: "📜",
  MEX: "🇲🇽",
  RSA: "🇿🇦",
  KOR: "🇰🇷",
  CZE: "🇨🇿",
  CAN: "🇨🇦",
  BIH: "🇧🇦",
  QAT: "🇶🇦",
  SUI: "🇨🇭",
  BRA: "🇧🇷",
  MAR: "🇲🇦",
  HAI: "🇭🇹",
  SCO: "🏴",
  USA: "🇺🇸",
  PAR: "🇵🇾",
  AUS: "🇦🇺",
  TUR: "🇹🇷",
  GER: "🇩🇪",
  CUW: "🇨🇼",
  CIV: "🇨🇮",
  ECU: "🇪🇨",
  NED: "🇳🇱",
  JPN: "🇯🇵",
  SWE: "🇸🇪",
  TUN: "🇹🇳",
  BEL: "🇧🇪",
  EGY: "🇪🇬",
  IRN: "🇮🇷",
  NZL: "🇳🇿",
  ESP: "🇪🇸",
  CPV: "🇨🇻",
  KSA: "🇸🇦",
  URU: "🇺🇾",
  FRA: "🇫🇷",
  SEN: "🇸🇳",
  IRQ: "🇮🇶",
  NOR: "🇳🇴",
  ARG: "🇦🇷",
  ALG: "🇩🇿",
  AUT: "🇦🇹",
  JOR: "🇯🇴",
  POR: "🇵🇹",
  COD: "🇨🇩",
  UZB: "🇺🇿",
  COL: "🇨🇴",
  ENG: "🏴",
  CRO: "🇭🇷",
  GHA: "🇬🇭",
  PAN: "🇵🇦",
};

export function buildStickerExportText({ stickers, progressByStickerNumber }: BuildStickerExportTextInput): string {
  const missingGroups = buildCompactStickerGroups(stickers, progressByStickerNumber, "missing");
  const repeatedGroups = buildCompactStickerGroups(stickers, progressByStickerNumber, "repeated");

  return [
    "Missing",
    "",
    formatCompactStickerGroups(missingGroups, "No missing stickers."),
    "",
    "Repeated",
    "",
    formatCompactStickerGroups(repeatedGroups, "No repeated stickers."),
    "",
    FOOTER_TEXT,
  ].join("\n");
}

export async function copyStickerExportText(content: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textArea = document.createElement("textarea");

  textArea.value = content;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function buildCompactStickerGroups(
  stickers: Sticker[],
  progressByStickerNumber: Record<string, UserStickerProgress>,
  mode: "missing" | "repeated",
): CompactStickerGroup[] {
  const groups: CompactStickerGroup[] = [];
  const groupIndexes = new Map<string, number>();

  stickers.forEach((sticker) => {
    const stickerProgress = progressByStickerNumber[sticker.number];
    const shouldInclude = mode === "missing" ? !stickerProgress?.owned : stickerProgress?.repeated === true;

    if (!shouldInclude) {
      return;
    }

    const groupKey = getCompactGroupKey(sticker.number);
    const existingGroupIndex = groupIndexes.get(groupKey);
    const number = getCompactStickerNumber(sticker.number);

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

function formatCompactStickerGroups(groups: CompactStickerGroup[], emptyMessage: string): string {
  if (groups.length === 0) {
    return emptyMessage;
  }

  return groups
    .map((group) => {
      const emoji = group.emoji ? ` ${group.emoji}` : "";
      return `${group.displayCode}${emoji}: ${group.numbers.join(", ")}`;
    })
    .join("\n");
}

function getCompactGroupKey(stickerNumber: string): string {
  if (stickerNumber === "00") {
    return "FWC_WORLD";
  }

  const parsed = parseStickerCodeAndNumber(stickerNumber);

  if (parsed.code === "FWC") {
    const numericValue = Number(parsed.number);

    if (numericValue >= 1 && numericValue <= 8) {
      return "FWC_WORLD";
    }

    if (numericValue >= 9 && numericValue <= 19) {
      return "FWC_HISTORY";
    }
  }

  return parsed.code;
}

function getCompactDisplayCode(groupKey: string): string {
  if (groupKey === "FWC_WORLD" || groupKey === "FWC_HISTORY") {
    return "FWC";
  }

  return groupKey;
}

function getCompactEmoji(groupKey: string): string {
  return STICKER_GROUP_EMOJIS[groupKey] ?? "";
}

function getCompactStickerNumber(stickerNumber: string): string {
  if (stickerNumber === "00") {
    return "00";
  }

  return parseStickerCodeAndNumber(stickerNumber).number;
}

function parseStickerCodeAndNumber(stickerNumber: string): { code: string; number: string } {
  const match = stickerNumber.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    return {
      code: stickerNumber,
      number: stickerNumber,
    };
  }

  return {
    code: match[1],
    number: match[2],
  };
}
