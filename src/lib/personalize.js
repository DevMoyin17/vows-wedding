/**
 * Guest personalisation.
 * Guests open their own link, e.g.  ?guest=Tolu%20Adebayo&seats=2
 * The demo defaults to the fictional guest "Tolu Adebayo".
 */
const NO_GUEST = { name: "", firstName: "", seats: 2 };

export function readGuestFromLocation(search = window.location.search) {
  try {
    const params = new URLSearchParams(search);
    const name = (params.get("guest") ?? "").trim();
    const seatsRaw = parseInt(params.get("seats") ?? "", 10);
    if (!name) return NO_GUEST; // no personalisation — the guest types their own name
    return {
      name,
      firstName: name.split(/\s+/)[0],
      seats: Number.isFinite(seatsRaw) && seatsRaw > 0 ? Math.min(seatsRaw, 10) : 1,
    };
  } catch {
    return NO_GUEST;
  }
}

export const DEMO_GUEST = NO_GUEST;
