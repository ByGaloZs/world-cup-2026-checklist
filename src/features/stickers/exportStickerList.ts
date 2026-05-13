import type { Sticker } from "../../types/sticker";
import type { UserStickerProgress } from "../../types/userProgress";

type BuildStickerExportTextInput = {
  stickers: Sticker[];
  progressByStickerNumber: Record<string, UserStickerProgress>;
  generatedAt?: Date;
};

const EXPORT_FILENAME = "panini-world-cup-2026-checklist.txt";
const SECTION_SEPARATOR_LENGTH = 60;

export function buildStickerExportText({ stickers, progressByStickerNumber, generatedAt = new Date() }: BuildStickerExportTextInput): string {
  const owned = stickers.filter((sticker) => progressByStickerNumber[sticker.number]?.owned).length;
  const repeated = stickers.filter((sticker) => progressByStickerNumber[sticker.number]?.repeated).length;
  const missing = Math.max(stickers.length - owned, 0);
  const completion = stickers.length > 0 ? ((owned / stickers.length) * 100).toFixed(1) : "0.0";
  const missingStickers = stickers.filter((sticker) => !progressByStickerNumber[sticker.number]?.owned);
  const repeatedStickers = stickers.filter((sticker) => progressByStickerNumber[sticker.number]?.repeated === true);

  return [
    createSeparator(),
    "PANINI WORLD CUP 2026 CHECKLIST",
    createSeparator(),
    "",
    `Generated: ${formatDate(generatedAt)}`,
    "",
    "SUMMARY",
    createSeparator("-"),
    formatSummaryLine("Total stickers", stickers.length.toString()),
    formatSummaryLine("Owned stickers", owned.toString()),
    formatSummaryLine("Missing stickers", missing.toString()),
    formatSummaryLine("Repeated stickers", repeated.toString()),
    formatSummaryLine("Completion", `${completion}%`),
    "",
    createSeparator(),
    `MISSING STICKERS - ${missing}`,
    createSeparator(),
    "",
    formatStickerGroups(missingStickers, "missing", "No missing stickers."),
    "",
    "",
    createSeparator(),
    `REPEATED STICKERS - ${repeated}`,
    createSeparator(),
    "",
    formatStickerGroups(repeatedStickers, "repeated", "No repeated stickers."),
  ].join("\n");
}

export function downloadStickerExportText(content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = EXPORT_FILENAME;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createSeparator(char = "=", length = SECTION_SEPARATOR_LENGTH): string {
  return char.repeat(length);
}

function formatSummaryLine(label: string, value: string): string {
  return `${`${label}:`.padEnd(20, " ")}${value}`;
}

function formatStickerGroups(stickers: Sticker[], label: "missing" | "repeated", emptyMessage: string): string {
  if (stickers.length === 0) {
    return emptyMessage;
  }

  const groupedStickers = stickers.reduce<Record<string, Sticker[]>>((groups, sticker) => {
    groups[sticker.team] = groups[sticker.team] ?? [];
    groups[sticker.team].push(sticker);
    return groups;
  }, {});

  return Object.entries(groupedStickers)
    .map(([team, teamStickers]) => formatStickerGroup(team, teamStickers, label))
    .join("\n\n");
}

function formatStickerGroup(team: string, stickers: Sticker[], label: "missing" | "repeated"): string {
  const numberColumnWidth = Math.max(...stickers.map((sticker) => sticker.number.length)) + 2;

  return [
    `${team} - ${stickers.length} ${label}`,
    createSeparator("-"),
    ...stickers.map((sticker) => formatStickerLine(sticker.number, sticker.name, numberColumnWidth)),
  ].join("\n");
}

function formatStickerLine(stickerNumber: string, stickerName: string, numberColumnWidth: number): string {
  return `${stickerNumber.padEnd(numberColumnWidth, " ")}${stickerName}`;
}
