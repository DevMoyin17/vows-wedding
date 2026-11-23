/**
 * Supabase client — RSVP management.
 * Create a project, run supabase/schema.sql, then set
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * (or in the hosting provider's environment variables).
 *
 * The client is imported on demand so the entrance never downloads it;
 * without configuration the app falls back to localStorage so the demo
 * keeps working end-to-end.
 */
const url = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabaseEnabled = Boolean(url && anonKey);

let clientPromise = null;

export function getSupabase() {
  if (!supabaseEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(url, anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }),
      )
      .catch((error) => {
        clientPromise = null; // allow a later retry
        throw error;
      });
  }
  return clientPromise;
}
