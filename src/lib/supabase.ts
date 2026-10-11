import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When the keys are missing (local development before the Supabase project
// exists) the app falls back to saving reports in this browser only.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

export const isCloudEnabled = supabase !== null;

export const SIGNATURE_BUCKET = "signatures";
