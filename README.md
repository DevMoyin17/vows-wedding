# VOWS — Digital Wedding Invitations

**Live:** https://vows-deborah-michael.vercel.app

VOWS is two experiences in one codebase:

- **`/` — the VOWS marketing site.** The public face of the platform: the experience,
  invitation designs, how it works, live invitation preview, pricing and enquiry form.
- **`/i/simeon-janet` — the flagship invitation.** A cinematic, mobile-first guest
  experience in blush silk, lace and pearl, with full tablet and desktop adaptations.

## Routes

| Route | What it is |
| --- | --- |
| `/` | VOWS marketing landing page |
| `/start` | Founding-invitation enquiry form (opens WhatsApp with the details) |
| `/i/simeon-janet` | The opening envelope for the flagship invitation |
| `/i/simeon-janet/the-couple` … `/i/simeon-janet/with-love` | The invitation itself |
| `/i/simeon-janet/rsvp?guest=…` | A direct reminder link that bypasses the envelope |
| `/preview` | Redirects to the live invitation |
| `/privacy`, `/terms` | Launch-ready policy placeholders |

The old root-level invitation links (`/the-couple`, `/rsvp`, etc.) redirect to their
scoped `/i/simeon-janet/...` equivalents, so existing reminder links keep working.

## The invitation

- **`/i/simeon-janet`** is the opening envelope. A new session always lands here, even
  if the shared URL points at a later section; the requested section is restored after
  the envelope opens.
- **`/i/simeon-janet/the-couple` … `/i/simeon-janet/with-love`** is a single continuous
  scrolling page: invitation card, save the date (live countdown), story, details,
  photographs, RSVP and closing.
- A direct `/i/simeon-janet/rsvp?guest=…` reminder link goes straight to the reply card.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview the build
```

Guest personalisation: open
`/i/simeon-janet?guest=Tolu%20Adebayo&seats=2` — the envelope opens into the invitation
with the RSVP greeting, prefilled name and seat count adapted to the link. For a link
that jumps straight to the reply card, use
`/i/simeon-janet/rsvp?guest=Tolu%20Adebayo&seats=2` (no envelope).

## Marketing site

The public VOWS site lives in `src/marketing/`:

- `LandingPage.jsx` — hero, experience, templates, how it works, features, live preview,
  pricing, founding invitation, FAQ and final CTA.
- `content.js` — nav, template catalogue, package prices, features and FAQ copy.
- `StartPage.jsx` — the founding-invitation enquiry form. It opens WhatsApp with the
  couple's details; there is no payment backend yet.
- `SimplePage.jsx` — privacy and terms placeholders.
- `src/styles/landing.css` — the editorial cream/plum/wine landing design.
- `src/styles/marketing.css` — the shared enquiry and legal-page styles.

The contact link and enquiry form use `CONTACT_WHATSAPP` in `src/marketing/content.js`.
Replace that with the VOWS sales number before publishing the page widely.

Only **Traditional Luxury** is live. The other designs are shown as coming-soon cards and
link to the waitlist/enquiry form. The live preview opens the real Simeon & Janet
invitation at `/i/simeon-janet`.

## Stack

| Concern | Choice |
| --- | --- |
| UI animations | Framer Motion (scene transitions, staggered reveals, press springs, lightbox) |
| Cinematic motion | GSAP timeline for the envelope opening (seal lift → flap → card rise → names write on) |
| RSVP management | Supabase (RPCs `submit_rsvp` / `get_rsvp`, RLS-locked table) with localStorage fallback |
| Wedding photographs | Local responsive variants by default; Cloudinary `f_auto,q_auto` when configured |
| Venue navigation | Google Maps directions / search deep links (no key required) |

## Supabase setup

1. Create a project at supabase.com.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It creates the
   `rsvps` table (RLS on), the two SECURITY DEFINER RPCs and grants execute to `anon`.
3. Fill `.env` (or the hosting provider's environment variables):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

Use the **anon** or **publishable** key from Project Settings → API. It is safe in the
browser; never use the `service_role` / secret key in a `VITE_` variable.

Without these the RSVP flow runs in demo mode (simulated latency, persisted locally).

## Guest links

Send each guest a personalised link:

```
https://vows-deborah-michael.vercel.app/i/simeon-janet?guest=Tolu%20Adebayo&seats=2
https://vows-deborah-michael.vercel.app/i/simeon-janet/rsvp?guest=Tolu%20Adebayo&seats=2
```

- `guest` is the full name used to look up and prefill the reply
- `seats` sets the initial guest count
- URL-encode spaces as `%20` (or build the links from a spreadsheet)
- The invitation link opens the envelope first; the `/rsvp` link jumps straight to the
  reply card for reminders
- A section link opened in a fresh session shows the envelope first, then the requested
  section

The envelope opens into the invitation page; the RSVP card carries the name and seat
count from the link. On a second visit the guest sees their saved reply and can update it
until the RSVP deadline.

## Viewing replies

Open **Supabase Dashboard → Table Editor → `rsvps`** and filter on
`invitation_slug = 'simeon-janet'`, or run:

```sql
select guest_name, choice, guests, note, updated_at
from public.rsvps
where invitation_slug = 'simeon-janet'
order by updated_at desc;
```

Direct table access is blocked from the browser; only the two RPCs are callable.

## Photographs

`npm run assets` regenerates the deployable media from the originals in
`media-originals/` (git-ignored). It:

- writes `xs` / `md` / `lg` JPEG variants per photo + `src/lib/photo-manifest.json`
- generates the Save the Date hero (`save-the-date.webp`) from the archived first-dance frame
- converts the entrance renders and decorative PNGs to WebP
- encodes the music bed to MP3
- rebuilds the favicons, app icons, web manifest and `assets/og/og-image.jpg`

```bash
npm run assets
```

Keep the originals in `media-originals/`; the script never needs the network.
Local variants are used when Cloudinary is not configured. To use Cloudinary, upload the
public ids listed in `src/lib/wedding.js` and set:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud
```

## Google Maps

Venue buttons use `https://www.google.com/maps/dir/?api=1&destination=...` with the
venue coordinates from `wedding.events[].coords`. An optional
`VITE_GOOGLE_MAPS_API_KEY` is only needed if you later embed a map.

## Typography

- **Cormorant Garamond** — couple names, headings and all date treatments
- **DM Sans** — body copy, buttons, forms and wedding details
- **Great Vibes** — small romantic flourishes only (ampersands, “With gratitude”, success)

## Deploy

The invite uses clean URLs (`/our-story`, `/rsvp`), so the host must fall back to
`index.html` for unknown paths. Both configurations are included:

### Netlify

1. Connect the repo, or drag the generated `dist/` folder onto app.netlify.com/drop.
2. Build command: `npm run build` · Publish directory: `dist`.
3. Add the environment variables under **Site settings → Environment variables**,
   then redeploy.

`netlify.toml` and `public/_redirects` handle the SPA fallback, cache headers and
security headers.

### Vercel

```bash
npx vercel          # preview deployment
npx vercel --prod   # production
```

`vercel.json` contains the SPA rewrite, cache headers and security headers. Add the
environment variables in the project settings before the production deploy.

### After the first deploy

Set the public URL in two places so link previews are absolute:

- the `og:image` / `twitter:image` tags in `index.html`
- the `image` field of the JSON-LD block in `index.html`

Then redeploy. The share card is generated at `assets/og/og-image.jpg` (1200×630).

### Production checklist

- [ ] `npm run build` passes
- [ ] Supabase project created, `supabase/schema.sql` applied, env vars set
- [ ] `?guest=Name&seats=N` links tested on a phone
- [ ] RSVP submit / update / error states tested
- [ ] `npm run assets` output committed if media changed
- [ ] OG image and favicon visible in a link preview
- [ ] Final URL added to `index.html`

## Structure

```
src/
  scenes/        01 Entrance (GSAP) … 09 Thank-you card
  components/    buttons, lace cards, pearls, seals, lightbox, chrome
  lib/           wedding content, RSVP, Supabase, media, Maps, ICS, sound
  styles/        tokens (Heirloom Lace), base, scenes (mobile → tablet → desktop)
scripts/
  optimize-assets.mjs   production media pipeline
supabase/schema.sql
```

Navigation: the envelope is its own page at `/`; opening it moves to `/the-couple`, the
first section of the single-page invitation (or to the section originally shared). A new
guest session always sees the envelope first. From there guests simply scroll; the top
bar, Explore drawer and clean URLs (`/our-story`, `/rsvp`) jump between sections. The
scroll spy keeps the URL and navigation in sync, cards reveal on scroll and lift on
hover, and the floating RSVP pill stays within reach on phones. Full reduced-motion
support is built in. “Replay” on the closing card returns to the envelope page.
