/**
 * Wedding content — Heirloom Lace template.
 * Every photograph is declared as { local, cloud }: `cloud` is the
 * Cloudinary public id used in production, `local` is the bundled copy.
 */

export const wedding = {
  template: "heirloom-lace",
  couple: {
    first: "Simeon",
    second: "Janet",
    initials: "SJ",
  },
  families: {
    bride: "Mr & Mrs Matthew",
    groom: "Elder & Mrs Adewuyi",
  },
  dateISO: "2027-02-20T08:00:00+01:00",
  city: "Ibadan, Nigeria",
  dateShort: "20 · 02 · 2027",
  dateLong: "Saturday, 20 February 2027",
  dateFooter: "SATURDAY · 20 FEBRUARY 2027 · IBADAN",
  rsvpBy: "6 February",
  rsvpByFull: "6 February 2027",

  requestLine: "request the honour of your presence at the marriage of their children",

  storyIntro: "From a first conversation to “I do” — a few chapters from our story.",

  photos: {
    hero: { local: "/assets/photos/gallery-1.jpg", cloud: "vows/heirloom/hero-walk" },
    bouquet: { local: "/assets/photos/gallery-2.jpg", cloud: "vows/heirloom/bouquet" },
    rings: { local: "/assets/photos/gallery-6.jpg", cloud: "vows/heirloom/rings" },
    cake: { local: "/assets/photos/gallery-3.jpg", cloud: "vows/heirloom/cake" },
    dinner: { local: "/assets/photos/gallery-5.jpg", cloud: "vows/heirloom/dinner" },
    atrium: { local: "/assets/photos/gallery-4.jpg", cloud: "vows/heirloom/atrium" },
    chapel: { local: "/assets/photos/venue-chapel.jpg", cloud: "vows/heirloom/chapel" },
    church: { local: "/assets/photos/venue-church.jpg", cloud: "vows/heirloom/church" },
    met: { local: "/assets/photos/ms-met.jpg", cloud: "vows/heirloom/milestone-met" },
    firstDate: { local: "/assets/photos/ms-first-date.jpg", cloud: "vows/heirloom/milestone-first-date" },
    proposal: { local: "/assets/photos/ms-proposal.jpg", cloud: "vows/heirloom/milestone-proposal" },
    weddingDay: { local: "/assets/photos/ms-rings.jpg", cloud: "vows/heirloom/milestone-wedding" },
    saveTheDate: { local: "/assets/photos/save-the-date.webp", cloud: "vows/heirloom/save-the-date" },
  },

  story: [
    {
      date: "The beginning",
      title: "Where it began",
      text: "Simeon and Janet’s story began with a conversation neither of them wanted to end. What started as a chance meeting grew into a friendship, and then into something neither could imagine life without.",
      photoKey: "met",
    },
    {
      date: "The first date",
      title: "Our first date",
      text: "The first date was simple — good food, easy laughter and a conversation that carried on long after the plates were cleared. By the end of the evening, they both knew this was the beginning of something lasting.",
      photoKey: "firstDate",
    },
    {
      date: "The proposal",
      title: "The proposal",
      text: "Simeon planned a quiet moment with the people closest to them. There were nerves, a few happy tears and a question that had been on his heart for a long time. Janet said yes.",
      photoKey: "proposal",
    },
    {
      date: "20 February 2027",
      title: "The wedding",
      text: "On Saturday, 20 February 2027, Simeon and Janet will gather their families and friends in Ibadan to celebrate the beginning of their married life. They would love for you to be there.",
      photoKey: "weddingDay",
    },
  ],

  events: [
    {
      label: "Traditional wedding",
      name: "Richbam Junction",
      time: "8:00 AM",
      address: "Alao-Akala Expressway, Oluyole, Ibadan",
      fullAddress:
        "Richbam Junction, Alao-Akala Expressway, Oluyole, Ibadan, Oyo State, Nigeria",
      startISO: "2027-02-20T08:00:00+01:00",
      endISO: "2027-02-20T10:30:00+01:00",
      photoKey: "hero",
    },
    {
      label: "Church wedding",
      name: "Living Faith Church",
      time: "11:00 AM",
      address: "Akala Express, Ibadan",
      fullAddress: "Living Faith Church, Akala Express, Ibadan, Oyo State, Nigeria",
      startISO: "2027-02-20T11:00:00+01:00",
      endISO: "2027-02-20T12:00:00+01:00",
      photoKey: "church",
    },
    {
      label: "Reception",
      name: "Richbam Junction",
      time: "12:00 PM",
      address: "Alao-Akala Expressway, Oluyole, Ibadan",
      fullAddress:
        "Richbam Junction, Alao-Akala Expressway, Oluyole, Ibadan, Oyo State, Nigeria",
      startISO: "2027-02-20T12:00:00+01:00",
      endISO: "2027-02-20T17:00:00+01:00",
      photoKey: "atrium",
    },
  ],

  programme: [
    { title: "Guests arrive", time: "7:30 AM" },
    { title: "Traditional wedding", time: "8:00 AM" },
    { title: "Move to church", time: "10:30 AM" },
    { title: "Church wedding", time: "11:00 AM" },
    { title: "Reception", time: "12:00 PM" },
    { title: "Lunch & toasts", time: "2:00 PM" },
    { title: "First dance", time: "4:00 PM" },
  ],

  dress: {
    headline: "Formal · Blush & white",
    text: "Gowns and suits in soft blush, white or silver.",
  },

  gallery: [
    { photoKey: "hero", caption: "The walk", alt: "Simeon and Janet walking hand in hand along a tree-lined path at golden hour" },
    { photoKey: "bouquet", caption: "Her bouquet", alt: "Janet’s white rose and eucalyptus bouquet" },
    { photoKey: "rings", caption: "The rings", alt: "Gold wedding rings on ivory satin" },
    { photoKey: "cake", caption: "The cake", alt: "Four-tier white and gold wedding cake" },
    { photoKey: "dinner", caption: "Dinner", alt: "A place setting with gold cutlery and olive leaves" },
    { photoKey: "atrium", caption: "The atrium", alt: "The reception ballroom set for dinner under chandeliers" },
  ],

  music: { label: "Our song", src: "/assets/audio/our-song.mp3" },

  invitation: { slug: "simeon-janet" },
};
