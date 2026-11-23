/**
 * Wedding content — Heirloom Lace template.
 * Every photograph is declared as { local, cloud }: `cloud` is the
 * Cloudinary public id used in production, `local` is the bundled demo copy.
 */

export const wedding = {
  template: "heirloom-lace",
  couple: {
    first: "Deborah",
    second: "Michael",
    initials: "DM",
  },
  families: {
    bride: "Mr & Mrs Adeyemi",
    groom: "Mr & Mrs Okafor",
  },
  dateISO: "2027-02-20T10:00:00+01:00",
  city: "Ibadan, Nigeria",
  dateShort: "20 · 02 · 2027",
  dateLong: "Saturday, 20 February 2027",
  dateFooter: "SATURDAY · 20 FEBRUARY 2027 · IBADAN",
  rsvpBy: "20 January",
  rsvpByFull: "20 January 2027",

  requestLine: "request the honour of your presence at the marriage of their children",

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
  },

  story: [
    { date: "September 2019", title: "Where we met", text: "A friend’s birthday dinner in Ibadan, laughter over jollof rice and small chops, and a conversation neither of us wanted to end. Michael walked Deborah to her car that night and asked for her number. Three days later, we had our first proper date.", photoKey: "met" },
    { date: "December 2019", title: "Our first date", text: "Michael booked a quiet corner table at a small restaurant in Bodija — white tablecloths, candlelight, and a menu neither of us quite understood. Deborah ordered the safest dish on it, Michael ordered the strangest, and we ended up sharing both. We stayed long after dessert, talking until the staff began stacking chairs around us.", photoKey: "firstDate" },
    { date: "June 2026", title: "The proposal", text: "Michael planned a quiet Sunday lunch at his parents’ home, then disappeared into the garden. When Deborah followed, the fairy lights were already on, her favourite songs were playing softly, and both families were watching from the veranda. He spoke about the seven years since that birthday dinner, got halfway through his speech, gave up on the words and simply asked. She said yes before he finished.", photoKey: "proposal" },
    { date: "February 2027", title: "The wedding", text: "On the morning of 20 February 2027, the people who shaped us will gather at The White Chapel — our parents, our siblings, and the friends who held every chapter of this story. We will say our vows at ten, celebrate at noon, and dance long after the sun sets. After all this time, the only thing missing is you.", photoKey: "weddingDay" },
  ],

  events: [
    {
      label: "Church wedding",
      name: "The White Chapel",
      time: "10:00 AM",
      address: "14 Bodija Road, Ibadan",
      fullAddress: "The White Chapel, 14 Bodija Road, Ibadan, Oyo State, Nigeria",
      coords: { lat: 7.4305, lng: 3.9096 },
      photoKey: "church",
    },
    {
      label: "Reception",
      name: "The Grand Atrium",
      time: "12:00 PM",
      address: "3 Jericho GRA, Ibadan",
      fullAddress: "The Grand Atrium, 3 Jericho GRA, Ibadan, Oyo State, Nigeria",
      coords: { lat: 7.4087, lng: 3.8812 },
      photoKey: "atrium",
    },
  ],

  programme: [
    { title: "Guests arrive", time: "9:30 AM" },
    { title: "The ceremony", time: "10:00 AM" },
    { title: "Photographs", time: "11:30 AM" },
    { title: "Reception", time: "12:00 PM" },
    { title: "Dinner & toasts", time: "2:00 PM" },
    { title: "First dance", time: "3:30 PM" },
  ],

  dress: {
    headline: "Formal · Blush & white",
    text: "Gowns and suits in soft blush, white or silver.",
  },

  gallery: [
    { photoKey: "hero", caption: "The walk", alt: "Deborah and Michael walking hand in hand along a tree-lined path at golden hour" },
    { photoKey: "bouquet", caption: "Her bouquet", alt: "Deborah’s white rose and eucalyptus bouquet" },
    { photoKey: "rings", caption: "The rings", alt: "Gold wedding rings on ivory satin" },
    { photoKey: "cake", caption: "The cake", alt: "Four-tier white and gold wedding cake" },
    { photoKey: "dinner", caption: "Dinner", alt: "A place setting with gold cutlery and olive leaves" },
    { photoKey: "atrium", caption: "The atrium", alt: "The reception ballroom set for dinner under chandeliers" },
  ],

  music: { label: "Our song", src: "/assets/audio/our-song.wav" },

  invitation: { slug: "deborah-michael" },
};
