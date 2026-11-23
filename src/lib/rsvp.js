import { wedding } from "./wedding";
import { getSupabase, supabaseEnabled } from "./supabase";

/**
 * RSVP service.
 * - Supabase (RPCs `submit_rsvp` / `get_rsvp`) when configured.
 * - localStorage fallback otherwise, so the demo behaves identically.
 *
 * Never exposes other guests' data: both paths are scoped to this
 * invitation slug + the guest's own name.
 */

const KEY = "vows:rsvp";
const SLUG = wedding.invitation.slug;

export function isRsvpClosed(now = Date.now()) {
  const deadline = new Date(`${wedding.rsvpByFull} 23:59:59 GMT+0100`).getTime();
  return Number.isFinite(deadline) && now > deadline;
}

function readLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(rsvp) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rsvp));
  } catch {
    /* private mode — the UI still confirms */
  }
}

export function clearLocalRsvp() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** Fetch this guest's saved reply, if any. */
export async function getRsvp(name) {
  if (supabaseEnabled) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc("get_rsvp", {
        p_invitation: SLUG,
        p_guest_name: name,
      });
      if (!error && data) return data;
      if (error) console.warn("Supabase get_rsvp failed, using local fallback:", error.message);
    } catch (err) {
      console.warn("Supabase unreachable, using local fallback:", err?.message);
    }
  }
  const saved = readLocal();
  return saved && saved.name?.toLowerCase() === name.toLowerCase() ? saved : null;
}

/** Submit (or update) this guest's reply. */
export async function submitRsvp(rsvp) {
  if (supabaseEnabled) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc("submit_rsvp", {
        p_invitation: SLUG,
        p_guest_name: rsvp.name,
        p_choice: rsvp.choice,
        p_guests: rsvp.guests,
        p_note: rsvp.note ?? null,
      });
      if (error) throw error;
      writeLocal(rsvp); // keep a local echo for instant reloads
      return { ok: true, rsvp, source: "supabase", data };
    } catch (err) {
      console.warn("Supabase submit failed:", err?.message);
      return { ok: false, error: "network" };
    }
  }

  // demo mode: simulate latency and support ?rsvpfail=1 for state reviews
  const fail = new URLSearchParams(window.location.search).has("rsvpfail");
  await new Promise((r) => setTimeout(r, 900));
  if (fail) return { ok: false, error: "network" };
  writeLocal(rsvp);
  return { ok: true, rsvp, source: "local" };
}
