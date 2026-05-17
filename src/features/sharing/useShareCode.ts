import { useCallback, useEffect, useState } from "react";
import type { ProfileShareCode } from "../../types/shareCode";
import { getOrCreateUserShareCode } from "./shareCodeService";

function getShareUrl(shareCode: ProfileShareCode | null): string | null {
  if (!shareCode || typeof window === "undefined") {
    return null;
  }

  return `${window.location.origin}/share/${shareCode.share_code}`;
}

export function useShareCode(userId?: string) {
  const [shareCode, setShareCode] = useState<ProfileShareCode | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refreshShareCode = useCallback(async () => {
    if (!userId) {
      setShareCode(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextShareCode = await getOrCreateUserShareCode(userId);
      setShareCode(nextShareCode);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load share code.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshShareCode();
  }, [refreshShareCode]);

  return {
    shareCode,
    shareUrl: getShareUrl(shareCode),
    loading,
    error,
    refreshShareCode,
  };
}
