-- ============================================================================
-- VOWS · Supabase schema — RSVP management
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_slug text not null,
  guest_name text not null,
  choice text not null check (choice in ('accepts', 'declines')),
  guests int not null default 0 check (guests >= 0 and guests <= 20),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One reply per guest, regardless of capitalisation ("Tolu" = "tolu").
create unique index if not exists rsvps_unique_guest_ci
  on public.rsvps (invitation_slug, lower(guest_name));

alter table public.rsvps enable row level security;

-- Guests never read or write the table directly: all access goes through
-- SECURITY DEFINER functions scoped to one invitation + one guest.

create or replace function public.submit_rsvp(
  p_invitation text,
  p_guest_name text,
  p_choice text,
  p_guests int,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rsvps;
begin
  if p_choice not in ('accepts', 'declines') then
    raise exception 'invalid choice';
  end if;

  if coalesce(trim(p_guest_name), '') = '' then
    raise exception 'guest name required';
  end if;

  insert into public.rsvps (invitation_slug, guest_name, choice, guests, note)
  values (p_invitation, trim(p_guest_name), p_choice, greatest(0, least(p_guests, 20)), nullif(trim(p_note), ''))
  on conflict (invitation_slug, lower(guest_name))
  do update set
    guest_name = excluded.guest_name,
    choice = excluded.choice,
    guests = excluded.guests,
    note = excluded.note,
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row) - 'id';
end;
$$;

create or replace function public.get_rsvp(
  p_invitation text,
  p_guest_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rsvps;
begin
  select * into v_row
  from public.rsvps
  where invitation_slug = p_invitation
    and lower(guest_name) = lower(trim(p_guest_name))
  limit 1;

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'name', v_row.guest_name,
    'choice', v_row.choice,
    'guests', v_row.guests,
    'note', v_row.note,
    'updated_at', v_row.updated_at
  );
end;
$$;

-- Only the RPC surface is callable by the anon role.
revoke all on function public.submit_rsvp(text, text, text, int, text) from public;
revoke all on function public.get_rsvp(text, text) from public;
grant execute on function public.submit_rsvp(text, text, text, int, text) to anon, authenticated;
grant execute on function public.get_rsvp(text, text) to anon, authenticated;

-- Helpful for the couple dashboard later:
create index if not exists rsvps_invitation_idx on public.rsvps (invitation_slug);
