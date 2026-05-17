import { hasSupabaseConfig, supabase } from "../../lib/supabase";
import type { ProfileShareCode } from "../../types/shareCode";

function ensureSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase is not configured. Add your project URL and anon key to .env.");
  }
}

function generateShareCode(): string {
  const randomPart = crypto.randomUUID().replaceAll("-", "");
  return randomPart.slice(0, 16);
}

const profileShareCodeColumns = "id,user_id,share_code,is_active,created_at,updated_at";

export async function getUserShareCode(userId: string): Promise<ProfileShareCode | null> {
  ensureSupabaseConfig();

  const { data, error } = await supabase
    .from("profile_share_codes")
    .select(profileShareCodeColumns)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  return data as ProfileShareCode | null;
}

export async function createUserShareCode(userId: string): Promise<ProfileShareCode> {
  ensureSupabaseConfig();

  const { data, error } = await supabase
    .from("profile_share_codes")
    .insert({
      user_id: userId,
      share_code: generateShareCode(),
      is_active: true,
    })
    .select(profileShareCodeColumns)
    .single();

  if (error) throw error;

  return data as ProfileShareCode;
}

export async function getOrCreateUserShareCode(userId: string): Promise<ProfileShareCode> {
  const existingShareCode = await getUserShareCode(userId);

  if (existingShareCode) {
    return existingShareCode;
  }

  return createUserShareCode(userId);
}
