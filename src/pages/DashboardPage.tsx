import { useMemo, useState } from "react";
import stickersData from "../data/stickers.json";
import { AppLayout } from "../components/layout/AppLayout";
import { ScanFriendQrModal } from "../components/sharing/ScanFriendQrModal";
import { StickerFilters } from "../components/stickers/StickerFilters";
import { StickerGroup } from "../components/stickers/StickerGroup";
import { StickerSearch } from "../components/stickers/StickerSearch";
import { StickerStats } from "../components/stickers/StickerStats";
import { useAuth } from "../features/auth/useAuth";
import { compareStickerProgress } from "../features/sharing/compareStickerProgress";
import {
  buildStickerExportText,
  copyStickerExportText,
  getCompactDisplayCode,
  getCompactEmoji,
  getCompactGroupKey,
  getCompactStickerNumber,
} from "../features/stickers/exportStickerList";
import { useStickerProgress } from "../features/stickers/useStickerProgress";
import type { SharedStickerProgress } from "../types/sharedProgress";
import type { Sticker, StickerFilter } from "../types/sticker";
import type { TradeMatch } from "../types/tradeMatch";

const stickers = stickersData as Sticker[];

function getRepeatedCount(progress: { repeated?: boolean; repeated_count?: number } | undefined): number {
  return progress?.repeated_count ?? (progress?.repeated ? 1 : 0);
}

type CompactTradeMatchGroup = {
  groupKey: string;
  displayCode: string;
  emoji: string;
  numbers: string[];
};

function formatTradeMatchNumber(match: TradeMatch): string {
  const number = getCompactStickerNumber(match.sticker.number);

  return match.repeatedCount > 1 ? `${number}x${match.repeatedCount}` : number;
}

function buildCompactTradeMatchGroups(matches: TradeMatch[]): CompactTradeMatchGroup[] {
  const groups: CompactTradeMatchGroup[] = [];
  const groupIndexes = new Map<string, number>();

  matches.forEach((match) => {
    const groupKey = getCompactGroupKey(match.sticker.number);
    const existingGroupIndex = groupIndexes.get(groupKey);
    const number = formatTradeMatchNumber(match);

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

function TradeMatchGroups({ matches, emptyMessage }: { matches: TradeMatch[]; emptyMessage: string }) {
  const groups = buildCompactTradeMatchGroups(matches);

  if (groups.length === 0) {
    return <p className="text-sm text-slate-600">{emptyMessage}</p>;
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

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, loading, error, updateStickerProgress } = useStickerProgress(user?.id);
  const [filter, setFilter] = useState<StickerFilter>("all");
  const [search, setSearch] = useState("");
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [friendProgress, setFriendProgress] = useState<SharedStickerProgress[] | null>(null);
  const [friendShareCode, setFriendShareCode] = useState<string | null>(null);

  const stats = useMemo(() => {
    const owned = stickers.filter((sticker) => progress[sticker.number]?.owned).length;
    const repeated = stickers.filter((sticker) => getRepeatedCount(progress[sticker.number]) > 0).length;

    return { total: stickers.length, owned, repeated };
  }, [progress]);

  const filteredStickers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return stickers.filter((sticker) => {
      const stickerProgress = progress[sticker.number];
      const owned = stickerProgress?.owned ?? false;
      const repeated = getRepeatedCount(stickerProgress) > 0;
      const matchesFilter =
        filter === "all" ||
        (filter === "missing" && !owned) ||
        (filter === "owned" && owned) ||
        (filter === "repeated" && repeated);
      const searchable = `${sticker.number} ${sticker.name} ${sticker.team}`.toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || searchable.includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, progress, search]);

  const groupedStickers = useMemo(() => {
    return filteredStickers.reduce<Record<string, Sticker[]>>((groups, sticker) => {
      groups[sticker.team] = groups[sticker.team] ?? [];
      groups[sticker.team].push(sticker);
      return groups;
    }, {});
  }, [filteredStickers]);

  const teamStats = useMemo(() => {
    return stickers.reduce<Record<string, { owned: number; total: number }>>((statsByTeam, sticker) => {
      const currentStats = statsByTeam[sticker.team] ?? { owned: 0, total: 0 };

      statsByTeam[sticker.team] = {
        owned: currentStats.owned + (progress[sticker.number]?.owned ? 1 : 0),
        total: currentStats.total + 1,
      };

      return statsByTeam;
    }, {});
  }, [progress]);

  const tradeComparison = useMemo(() => {
    if (!friendProgress) {
      return null;
    }

    return compareStickerProgress({
      stickers,
      myProgressByStickerNumber: progress,
      friendProgress,
    });
  }, [friendProgress, progress]);

  const visibleTeams = Object.keys(groupedStickers);

  function toggleTeam(team: string): void {
    setCollapsedTeams((current) => ({ ...current, [team]: !current[team] }));
  }

  function expandAllTeams(): void {
    setCollapsedTeams((current) => {
      const next = { ...current };

      visibleTeams.forEach((team) => {
        next[team] = false;
      });

      return next;
    });
  }

  function collapseAllTeams(): void {
    setCollapsedTeams((current) => {
      const next = { ...current };

      visibleTeams.forEach((team) => {
        next[team] = true;
      });

      return next;
    });
  }

  async function copyTxtExport(): Promise<void> {
    const text = buildStickerExportText({
      stickers,
      progressByStickerNumber: progress,
    });

    try {
      await copyStickerExportText(text);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2500);
    } catch {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 3500);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">My Album</h2>
          <p className="mt-1 text-sm text-slate-600">Mark official/base stickers as owned or repeated. Changes are saved to your Supabase account.</p>
        </div>

        <StickerStats total={stats.total} owned={stats.owned} repeated={stats.repeated} />

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <StickerSearch value={search} onChange={setSearch} />
          <StickerFilters value={filter} onChange={setFilter} />
        </div>

        {loading ? <div className="rounded-lg bg-white p-4 text-sm text-slate-600">Loading sticker progress...</div> : null}
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {stickers.length === 0 ? (
          <div className="rounded-lg bg-white p-4 text-sm text-slate-600">No stickers are available yet.</div>
        ) : null}

        {!loading && stickers.length > 0 && filteredStickers.length === 0 ? (
          <div className="rounded-lg bg-white p-4 text-sm text-slate-600">No stickers match your search and filter.</div>
        ) : null}

        {stickers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {visibleTeams.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={expandAllTeams}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAllTeams}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Collapse all
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => void copyTxtExport()}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {copyStatus === "copied" ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Scan friend QR
            </button>
            {copyStatus === "error" ? <span className="self-center text-sm font-medium text-red-600">Could not copy. Try again.</span> : null}
          </div>
        ) : null}

        {tradeComparison ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-lg font-bold text-slate-950">Trade match results</h3>
              {friendShareCode ? <p className="break-all text-xs text-slate-500">Friend code: {friendShareCode}</p> : null}
            </div>

            {tradeComparison.friendCanGiveMe.length === 0 && tradeComparison.iCanGiveFriend.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No matches found.</p>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <h4 className="font-semibold text-slate-900">Your friend can give you</h4>
                  <div className="mt-2">
                    <TradeMatchGroups
                      matches={tradeComparison.friendCanGiveMe}
                      emptyMessage="No stickers your friend can give you."
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <h4 className="font-semibold text-slate-900">You can give your friend</h4>
                  <div className="mt-2">
                    <TradeMatchGroups
                      matches={tradeComparison.iCanGiveFriend}
                      emptyMessage="No stickers you can give your friend."
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : null}

        <div className="space-y-4">
          {Object.entries(groupedStickers).map(([team, teamStickers]) => (
            <StickerGroup
              key={team}
              team={team}
              stickers={teamStickers}
              progress={progress}
              ownedCount={teamStats[team]?.owned ?? 0}
              totalCount={teamStats[team]?.total ?? teamStickers.length}
              collapsed={collapsedTeams[team] ?? false}
              onToggle={() => toggleTeam(team)}
              onUpdate={(stickerNumber, patch) => void updateStickerProgress(stickerNumber, patch)}
            />
          ))}
        </div>
        <ScanFriendQrModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onFriendProgressLoaded={({ shareCode, progress }) => {
            setFriendShareCode(shareCode);
            setFriendProgress(progress);
          }}
        />
      </div>
    </AppLayout>
  );
}
