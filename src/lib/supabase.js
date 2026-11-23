import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — RSVP management.
 * Create a project, run supabase/schema.sql, then set
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.
 * Without configuration the app falls back to localStorage so the
 * demo keeps working end-to-end.
 */
const url = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const supabaseEnabled = Boolean(supabase);
