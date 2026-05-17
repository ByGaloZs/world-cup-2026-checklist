import { useMemo, useState } from "react";
import stickersData from "../data/stickers.json";
import { AppLayout } from "../components/layout/AppLayout";
import { ScanFriendQrModal } from "../components/sharing/ScanFriendQrModal";
import { TradeResultsModal } from "../components/sharing/TradeResultsModal";
import { StickerFilters } from "../components/stickers/StickerFilters";
import { StickerGroup } from "../components/stickers/StickerGroup";
import { StickerSearch } from "../components/stickers/StickerSearch";
import { StickerStats } from "../components/stickers/StickerStats";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/useAuth";
import { compareStickerProgress } from "../features/sharing/compareStickerProgress";
import { buildStickerExportText, copyStickerExportText } from "../features/stickers/exportStickerList";
import { useStickerProgress } from "../features/stickers/useStickerProgress";
import type { SharedStickerProgress } from "../types/sharedProgress";
import type { Sticker, StickerFilter } from "../types/sticker";

const stickers = stickersData as Sticker[];

function getRepeatedCount(progress: { repeated?: boolean; repeated_count?: number } | undefined): number {
  return progress?.repeated_count ?? (progress?.repeated ? 1 : 0);
}

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, loading, error, updateStickerProgress } = useStickerProgress(user?.id);
  const [filter, setFilter] = useState<StickerFilter>("all");
  const [search, setSearch] = useState("");
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTradeResultsOpen, setIsTradeResultsOpen] = useState(false);
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
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-950">My Album</h2>
          <p className="mt-1 text-sm text-slate-600">Mark official/base stickers as owned or repeated. Changes are saved to your Supabase account.</p>
        </div>

        <StickerStats total={stats.total} owned={stats.owned} repeated={stats.repeated} />

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <StickerSearch value={search} onChange={setSearch} />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Filter stickers</p>
            <StickerFilters value={filter} onChange={setFilter} />
          </div>
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
          <div className="space-y-3">
            {visibleTeams.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                  <Button
                  type="button"
                  variant="secondary"
                  onClick={expandAllTeams}
                  className="h-11 justify-center"
                >
                  Expand all
                </Button>
                  <Button
                  type="button"
                  variant="secondary"
                  onClick={collapseAllTeams}
                  className="h-11 justify-center"
                >
                  Collapse all
                </Button>
                </div>
              </div>
            ) : null}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sharing</p>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  variant={copyStatus === "copied" ? "success" : "primary"}
                  onClick={() => void copyTxtExport()}
                  className="h-11 justify-center"
                >
                  {copyStatus === "copied" ? "Copied!" : "Copy list"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsScannerOpen(true)}
                  className="h-11 justify-center"
                >
                  <span className="sm:hidden">Scan QR</span>
                  <span className="hidden sm:inline">Scan friend QR</span>
                </Button>
              </div>
              {copyStatus === "error" ? <p className="mt-2 text-sm font-medium text-red-600">Could not copy. Try again.</p> : null}
            </div>
          </div>
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
            setIsScannerOpen(false);
            setIsTradeResultsOpen(true);
          }}
        />
        <TradeResultsModal
          isOpen={isTradeResultsOpen && Boolean(tradeComparison)}
          onClose={() => setIsTradeResultsOpen(false)}
          friendShareCode={friendShareCode}
          friendCanGiveMe={tradeComparison?.friendCanGiveMe ?? []}
          iCanGiveFriend={tradeComparison?.iCanGiveFriend ?? []}
        />
      </div>
    </AppLayout>
  );
}
