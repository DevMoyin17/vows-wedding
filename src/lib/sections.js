import { SLUGS } from "./routes";

/**
 * The single-page order. `id` is the scroll target (and the clean URL);
 * `short` is the desktop nav label.
 */
export const SECTIONS = [
  { n: 1, id: "invitation", label: "The invitation", short: "Invitation", note: "Open the envelope" },
  { n: 2, id: SLUGS[2], label: "The couple", short: "Couple", note: "Invitation card" },
  { n: 3, id: SLUGS[3], label: "Save the date", short: "Date", note: "20 · 02 · 2027" },
  { n: 4, id: SLUGS[4], label: "Our story", short: "Story", note: "Letters" },
  { n: 6, id: SLUGS[6], label: "Wedding details", short: "Details", note: "Ceremony & reception" },
  { n: 7, id: SLUGS[7], label: "Photographs", short: "Photos", note: "Keepsakes" },
  { n: 8, id: SLUGS[8], label: "RSVP", short: "RSVP", note: "The favour of a reply" },
  { n: 9, id: SLUGS[9], label: "With gratitude", short: "With love", note: "Closing" },
];

export const sectionFor = (n) => SECTIONS.find((section) => section.n === n);

export const sectionId = (n) => sectionFor(n)?.id;

/** Sections that live on the main invitation page (the envelope is its own page). */
export const MAIN_SECTIONS = SECTIONS.filter((section) => section.n >= 2);
