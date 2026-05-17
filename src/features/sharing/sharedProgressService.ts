import { hasSupabaseConfig, supabase } from "../../lib/supabase";
import type { SharedStickerProgress } from "../../types/sharedProgress";

function ensureSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase is not configured. Add your project URL and anon key to .env.");
  }
}

export function extractShareCodeFromQrValue(value: string): string | null {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const shareIndex = parts.indexOf("share");

    if (shareIndex >= 0 && parts[shareIndex + 1]) {
      return parts[shareIndex + 1];
    }
  } catch {
    // Not a URL. Treat as possible raw code.
  }

  if (/^[a-zA-Z0-9_-]{6,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export async function getSharedStickerProgress(shareCode: string): Promise<SharedStickerProgress[]> {
  ensureSupabaseConfig();

  const { data, error } = await supabase.rpc("get_shared_sticker_progress", {
    input_share_code: shareCode,
  });

  if (error) throw error;

  return (data ?? []) as SharedStickerProgress[];
}
