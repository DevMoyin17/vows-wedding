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

  storyIntro: "From a chance meeting at a birthday celebration to “I do” — a few chapters from our story.",

  photos: {
    hero: { local: "/assets/photos/prewedding-black-cream.jpg", cloud: "vows/heirloom/hero-prewedding" },
    detail: { local: "/assets/photos/proposal.jpg", cloud: "vows/heirloom/proposal-detail" },
    church: { local: "/assets/photos/living-faith-church.jpg", cloud: "vows/heirloom/living-faith-church" },
    churchCard: { local: "/assets/photos/living-faith-church-card.jpg", cloud: "vows/heirloom/living-faith-church-card" },
    venue: { local: "/assets/photos/richbam-event-place.jpg", cloud: "vows/heirloom/richbam" },
    met: { local: "/assets/photos/prewedding-burgundy-traditional.jpg", cloud: "vows/heirloom/prewedding-traditional" },
    firstDate: { local: "/assets/photos/first-date.jpg", cloud: "vows/heirloom/first-date" },
    proposal: { local: "/assets/photos/proposal.jpg", cloud: "vows/heirloom/proposal" },
    weddingDay: { local: "/assets/photos/prewedding-green.jpg", cloud: "vows/heirloom/prewedding-green" },
    preweddingBlackCream: { local: "/assets/photos/prewedding-black-cream.jpg", cloud: "vows/heirloom/prewedding-black-cream" },
    preweddingGreen: { local: "/assets/photos/prewedding-green.jpg", cloud: "vows/heirloom/prewedding-green" },
    preweddingBurgundy: { local: "/assets/photos/prewedding-burgundy-suit.jpg", cloud: "vows/heirloom/prewedding-burgundy" },
    preweddingTraditional: { local: "/assets/photos/prewedding-burgundy-traditional.jpg", cloud: "vows/heirloom/prewedding-traditional" },
    saveTheDate: { local: "/assets/photos/save-the-date.webp", cloud: "vows/heirloom/save-the-date" },
  },

  story: [
    {
      date: "The beginning",
      title: "Where it began",
      text: [
        "It began at a birthday celebration. As the evening came to an end, they exchanged contact details, giving them a reason to continue the conversation beyond the party. What followed were sweet messages, late-night conversations, laughter, and a growing friendship that slowly blossomed into love.",
        "With every conversation, they discovered more reasons to appreciate one another, and their hearts became increasingly connected. What started as a chance meeting at a birthday celebration turned into a beautiful journey of love, friendship, understanding, and shared dreams. Neither could have imagined that attending that birthday party would lead them to the person they would eventually call their forever.",
        "And today, their story continues — not just as two people who met by chance, but as two hearts who found love and chose to build a lifetime together.",
      ],
      photoKey: "met",
    },
    {
      date: "The first date",
      title: "Our first date",
      text: [
        "After their unexpected meeting and the beautiful connection that followed, they finally decided to go on their first official date. Excited and a little nervous, they both looked forward to spending time together away from the noise of everyday life.",
        "He planned a lovely outdoor picnic, complete with flowers, soft music, delicious treats, and a cozy setting beneath the evening sky. When she arrived, his face lit up, and for a moment, he forgot everything he had planned to say. She smiled at him, and the nervousness between them slowly melted away.",
        "They spent the afternoon talking, laughing, sharing stories about their childhood, dreams, family, and the things that mattered most to them. They teased each other, took cute pictures, and enjoyed the simple joy of being in each other's company. What was meant to be just a first date became a moment neither of them wanted to end.",
        "As the sun began to set, they sat close together, sharing quiet moments and stealing glances. Somewhere between the laughter, the conversations, and the warmth of being together, they realized that what they were building was something special.",
        "That first date wasn't just an outing; it was the beginning of countless memories, a deeper friendship, and a love that would eventually lead them to forever.",
      ],
      photoKey: "firstDate",
    },
    {
      date: "The proposal",
      title: "The proposal",
      text: [
        "Simeon planned a moment she would never forget — a room filled with roses, candlelight and the words she had been waiting to hear. There were nerves, happy tears, and a question that had been on his heart for a long time. Janet said yes.",
      ],
      photoKey: "proposal",
    },
    {
      date: "20 February 2027",
      title: "The wedding",
      text: [
        "On Saturday, 20 February 2027, Simeon and Janet will gather their families and friends in Ibadan to celebrate the beginning of their married life. They would love for you to be there.",
      ],
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
      photoKey: "venue",
    },
    {
      label: "Church wedding",
      name: "Living Faith Church",
      time: "11:00 AM",
      address: "Akala Express, Ibadan",
      fullAddress: "Living Faith Church, Akala Express, Ibadan, Oyo State, Nigeria",
      startISO: "2027-02-20T11:00:00+01:00",
      endISO: "2027-02-20T12:00:00+01:00",
      photoKey: "churchCard",
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
      photoKey: "venue",
    },
  ],

  dress: {
    eyebrow: "Aso Ebi",
    title: "Dress Code",
    intro:
      "We ask that men wear a native outfit — agbada, dansiki or sokoto — or a suit in blush pink or cream. Women are encouraged to wear a gele, iro and buba, or an evening gown in blush pink or cream.",
    guide:
      "To help us capture consistent photos, please dress in our two-colour palette below. Kindly avoid neon colours and all-white.",
    palette: [
      { name: "Blush pink", color: "#e7b4b8" },
      { name: "Cream", color: "#f3e8d5" },
    ],
  },

  gallery: [
    { photoKey: "preweddingTraditional", caption: "Traditional colours", alt: "Simeon and Janet in burgundy traditional attire" },
    { photoKey: "preweddingBlackCream", caption: "The shoot", alt: "Simeon and Janet in black and cream" },
    { photoKey: "preweddingGreen", caption: "In green", alt: "Simeon and Janet in emerald green" },
    { photoKey: "preweddingBurgundy", caption: "Burgundy", alt: "Simeon and Janet in burgundy suits" },
    { photoKey: "firstDate", caption: "Our first date", alt: "Simeon and Janet at their first date picnic" },
    { photoKey: "proposal", caption: "She said yes", alt: "Simeon proposing to Janet beneath a Will You Marry Me sign" },
    { photoKey: "church", caption: "The church", alt: "Living Faith Church, Akala Express, Ibadan" },
    { photoKey: "venue", caption: "Richbam", alt: "Richbam Event Place, Alao-Akala Expressway, Ibadan" },
  ],

  music: { label: "Our song", src: "/assets/audio/our-song.mp3" },

  invitation: { slug: "simeon-janet" },
};
