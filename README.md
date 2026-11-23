# VOWS — Heirloom Lace

The flagship digital wedding invitation: a cinematic, mobile-first guest experience in
blush silk, lace and pearl, with full tablet and desktop adaptations.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview the build
```

Guest personalisation: open `/?guest=Tolu%20Adebayo&seats=2` — the RSVP greeting,
prefilled name and seat count adapt to the link.

## Stack

| Concern | Choice |
| --- | --- |
| UI animations | Framer Motion (scene transitions, staggered reveals, press springs, lightbox) |
| Cinematic motion | GSAP timeline for the envelope opening (seal lift → flap → card rise → names write on) |
| RSVP management | Supabase (RPCs `submit_rsvp` / `get_rsvp`, RLS-locked table) with localStorage fallback |
| Wedding photographs | Cloudinary (`f_auto,q_auto`, crop + 2x srcset), local demo copies as fallback |
| Venue navigation | Google Maps directions / search deep links (no key required) |

## Supabase setup

1. Create a project at supabase.com.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It creates the
   `rsvps` table (RLS on), the two SECURITY DEFINER RPCs and grants execute to `anon`.
3. Fill `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

Without these the RSVP flow runs in demo mode (simulated latency, persisted locally).

## Cloudinary setup

1. Create a Cloudinary account and upload the photographs.
2. Use the public ids already listed in `src/lib/wedding.js` under `photos[].cloud`
   (`vows/heirloom/...`) or update them in one place.
3. Add `VITE_CLOUDINARY_CLOUD_NAME=your-cloud` to `.env`.

Without it, the bundled local photographs are used — the experience is identical.

## Google Maps

Venue buttons use `https://www.google.com/maps/dir/?api=1&destination=...` with the
venue coordinates from `wedding.events[].coords`. An optional
`VITE_GOOGLE_MAPS_API_KEY` is only needed if you later embed a map.

## Typography

- **Cormorant Garamond** — couple names, headings and all date treatments
- **DM Sans** — body copy, buttons, forms and wedding details
- **Great Vibes** — small romantic flourishes only (ampersands, “With gratitude”, success)

## Structure

```
src/
  scenes/        01 Entrance (GSAP) … 09 Thank-you card
  components/    buttons, lace cards, pearls, seals, lightbox, chrome
  lib/           wedding content, RSVP, Supabase, Cloudinary, Maps, ICS, sound
  styles/        tokens (Heirloom Lace), base, scenes (mobile → tablet → desktop)
supabase/schema.sql
```

Scene navigation: footer progress + RSVP, Explore drawer, `#/scene/N` deep links,
arrow keys on desktop, full reduced-motion support.
