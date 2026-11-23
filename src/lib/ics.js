import { wedding } from "./wedding";

/** Download an .ics covering both wedding events. */
export function downloadWeddingIcs() {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const events = wedding.events
    .map((e, i) => {
      const startUtc = i === 0 ? "20270220T090000Z" : "20270220T110000Z"; // 2PM / 5PM WAT
      const endUtc = i === 0 ? "20270220T103000Z" : "20270220T180000Z";
      return [
        "BEGIN:VEVENT",
        `UID:vows-${wedding.invitation.slug}-${i + 1}@vows.demo`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${startUtc}`,
        `DTEND:${endUtc}`,
        `SUMMARY:${wedding.couple.first} & ${wedding.couple.second} — ${e.label}`,
        `LOCATION:${e.fullAddress}`,
        `DESCRIPTION:${e.time}. ${wedding.dress.headline}.`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VOWS//Invitation//EN",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "deborah-michael-wedding.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
