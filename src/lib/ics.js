import { wedding } from "./wedding";

/** Download an .ics covering every wedding event. */
export function downloadWeddingIcs() {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const toUtc = (iso) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const events = wedding.events
    .map((event, index) => {
      const start = toUtc(event.startISO ?? wedding.dateISO);
      const end = toUtc(event.endISO ?? event.startISO ?? wedding.dateISO);
      return [
        "BEGIN:VEVENT",
        `UID:vows-${wedding.invitation.slug}-${index + 1}@vows.demo`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${wedding.couple.first} & ${wedding.couple.second} — ${event.label}`,
        `LOCATION:${event.fullAddress}`,
        `DESCRIPTION:${event.time}. Dress code: ${wedding.dress.palette.map((colour) => colour.name).join(" & ")}.`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VOWS//Invitation//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${wedding.couple.first} & ${wedding.couple.second} — Wedding`,
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${wedding.invitation.slug}-wedding.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
