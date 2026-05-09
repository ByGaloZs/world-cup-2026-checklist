import { hasSupabaseConfig, supabase } from "../../lib/supabase";
import type { UserStickerProgress } from "../../types/userProgress";

function ensureSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase is not configured. Add your project URL and anon key to .env.");
  }
}

export async function getUserStickerProgress(userId: string) {
  ensureSupabaseConfig();

  const { data, error } = await supabase
    .from("user_sticker_progress")
    .select("id,user_id,sticker_number,owned,repeated,updated_at")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []) as UserStickerProgress[];
}

export async function upsertUserStickerProgress(input: {
  userId: string;
  stickerNumber: string;
  owned?: boolean;
  repeated?: boolean;
}) {
  ensureSupabaseConfig();

  const { data, error } = await supabase
    .from("user_sticker_progress")
    .upsert(
      {
        user_id: input.userId,
        sticker_number: input.stickerNumber,
        owned: input.owned ?? false,
        repeated: input.repeated ?? false,
      },
      { onConflict: "user_id,sticker_number" },
    )
    .select("id,user_id,sticker_number,owned,repeated,updated_at")
    .single();

  if (error) throw error;

  return data as UserStickerProgress;
}
