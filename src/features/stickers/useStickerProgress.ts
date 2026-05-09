import { useCallback, useEffect, useState } from "react";
import type { UserStickerProgress } from "../../types/userProgress";
import { getUserStickerProgress, upsertUserStickerProgress } from "./stickerProgressService";

export type StickerProgressMap = Record<string, UserStickerProgress>;

type StickerProgressPatch = Partial<Pick<UserStickerProgress, "owned" | "repeated">>;

function normalizeStickerProgress(
  current: Pick<UserStickerProgress, "owned" | "repeated">,
  patch: StickerProgressPatch,
) {
  const next = {
    ...current,
    ...patch,
  };

  if (patch.repeated === true) {
    next.owned = true;
  }

  if (patch.owned === false) {
    next.repeated = false;
  }

  return next;
}

export function useStickerProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<StickerProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);

    try {
      const rows = await getUserStickerProgress(currentUserId);
      const nextProgress = rows.reduce<StickerProgressMap>((map, row) => {
        map[row.sticker_number] = row;
        return map;
      }, {});

      setProgress(nextProgress);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load sticker progress.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setProgress({});
      setLoading(false);
      return;
    }

    void loadProgress(userId);
  }, [loadProgress, userId]);

  const updateStickerProgress = useCallback(
    async (stickerNumber: string, patch: StickerProgressPatch) => {
      if (!userId) return;

      setError(null);
      const previous = progress[stickerNumber];
      const corrected = normalizeStickerProgress(
        {
          owned: previous?.owned ?? false,
          repeated: previous?.repeated ?? false,
        },
        patch,
      );
      const optimistic: UserStickerProgress = {
        ...previous,
        user_id: userId,
        sticker_number: stickerNumber,
        ...corrected,
      };

      setProgress((current) => ({
        ...current,
        [stickerNumber]: optimistic,
      }));

      try {
        const saved = await upsertUserStickerProgress({
          userId,
          stickerNumber,
          owned: optimistic.owned,
          repeated: optimistic.repeated,
        });

        setProgress((current) => ({
          ...current,
          [stickerNumber]: saved,
        }));
      } catch (caughtError) {
        setProgress((current) => {
          const next = { ...current };

          if (previous) {
            next[stickerNumber] = previous;
          } else {
            delete next[stickerNumber];
          }

          return next;
        });
        setError(caughtError instanceof Error ? caughtError.message : "Failed to save sticker progress.");
      }
    },
    [progress, userId],
  );

  return {
    progress,
    loading,
    error,
    loadProgress,
    updateStickerProgress,
  };
}
