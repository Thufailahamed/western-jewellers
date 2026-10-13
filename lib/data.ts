// Site content. Everything a page renders comes from here, so copy and pricing can be edited in one place.

import type { ImgKey } from "./images";

export type ModelKind = "solitaire" | "halo" | "trilogy" | "eternity" | "pendant" | "bangle" | "hoops" | "drops";
export type Metal = "yellow" | "white" | "rose";

export const CURRENCY = "£";

export const METALS: Record<Metal, { label: string; color: string; swatch: string }> = {
  yellow: { label: "18k Yellow Gold", color: "#f0c983", swatch: "linear-gradient(135deg,#f6dfa8,#c9963f)" },
  white: { label: "18k White Gold", color: "#e6e6e4", swatch: "linear-gradient(135deg,#ffffff,#a9a9a6)" },
  rose: { label: "18k Rose Gold", color: "#f1b598", swatch: "linear-gradient(135deg,#f9d3c0,#c2785a)" },
};

export type Piece = {
  slug: string;
  name: string;
  collection: string;
  model: ModelKind;
  metal: Metal;
  price: number | null;
  tagline: string;
  description: string;
  specs: [string, string][];
  sizes?: string[];
};

export type Collection = {
  slug: string;
  index: string;
  name: string;
  title: [string, string];
  kicker: string;
  intro: string;
  description: string;
  tint: string;
  model: ModelKind;
  metal: Metal;
  image: ImgKey;
};

const RING_SIZES = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"];

export const collections: Collection[] = [
  {
    slug: "solitaire",
    index: "01",
    name: "Solitaire",
    title: ["One stone,", "one promise"],
    kicker: "Engagement",
    intro: "Brilliant, oval and emerald cuts, from half a carat.",
    description:
      "A solitaire is the simplest ring there is, so everything has to be right. We hand-select each centre stone, then build the claws and gallery around it so the setting lets in as much light as possible.",
    tint: "#ece2d2",
    model: "solitaire",
    metal: "yellow",
    image: "handSolitaire",
  },
  {
    slug: "eternity",
    index: "02",
    name: "Eternity",
    title: ["All the way", "round"],
    kicker: "Wedding & anniversary",
    intro: "Bands set with matched diamonds, every stone chosen by eye.",
    description:
      "Our eternity bands are channel-set with stones matched for colour and size under daylight lamps. They are made to be worn every day, next to an engagement ring or on their own.",
    tint: "#e4e2dd",
    model: "eternity",
    metal: "white",
    image: "bandsGold",
  },
  {
    slug: "lumiere",
    index: "03",
    name: "Lumière",
    title: ["Light,", "close to the skin"],
    kicker: "Pendants & earrings",
    intro: "Drops and hoops that catch the light as you move.",
    description:
      "Lumière is made for movement. Pendants hang from fine trace chains and earrings are balanced to sit straight, so the stones turn and catch the light through the day.",
    tint: "#efe4d4",
    model: "pendant",
    metal: "yellow",
    image: "portraitEarring",
  },
  {
    slug: "heritage",
    index: "04",
    name: "Heritage",
    title: ["Gold, made", "to be handed down"],
    kicker: "Bangles & hoops",
    intro: "Heavy, hand-finished gold for everyday wear.",
    description:
      "Heritage pieces are forged from dense, recycled gold and finished by hand over several days. They are made to be worn every day for decades, then passed on.",
    tint: "#e9dfcc",
    model: "bangle",
    metal: "yellow",
    image: "bangleSilk",
  },
];

export const pieces: Piece[] = [
  // Solitaire
  {
    slug: "aurelia",
    name: "Aurelia",
    collection: "solitaire",
    model: "solitaire",
    metal: "yellow",
    price: 18500,
    tagline: "Six-claw cathedral solitaire",
    description:
      "Our signature ring. A round brilliant is held high in six tapered claws over an open cathedral gallery, so light reaches the stone from every side. The band narrows gently towards the setting.",
    specs: [["Centre stone", "2.02 ct round brilliant"], ["Colour / Clarity", "D / VVS1"], ["Setting", "Six-claw cathedral"], ["Band width", "2.2 mm"]],
    sizes: RING_SIZES,
  },
  {
    slug: "celeste",
    name: "Céleste",
    collection: "solitaire",
    model: "halo",
    metal: "white",
    price: 9800,
    tagline: "Halo solitaire",
    description:
      "A centre diamond ringed by a halo of sixteen smaller stones, which makes the centre look larger and brighter. Set in white gold to keep the whole ring looking cool and bright.",
    specs: [["Centre stone", "1.20 ct round brilliant"], ["Halo", "16 × 0.02 ct"], ["Colour / Clarity", "E / VS1"], ["Band width", "2.0 mm"]],
    sizes: RING_SIZES,
  },
  {
    slug: "trois",
    name: "Trois",
    collection: "solitaire",
    model: "trilogy",
    metal: "rose",
    price: 11200,
    tagline: "Three-stone ring",
    description:
      "Three diamonds for past, present and future. The side stones are angled slightly towards the centre so the three read as one shape on the hand.",
    specs: [["Total weight", "1.50 ct"], ["Centre stone", "0.90 ct round brilliant"], ["Colour / Clarity", "F / VS1"], ["Band width", "2.2 mm"]],
    sizes: RING_SIZES,
  },
  // Eternity
  {
    slug: "perpetua",
    name: "Perpetua",
    collection: "eternity",
    model: "eternity",
    metal: "yellow",
    price: 6400,
    tagline: "Full eternity band",
    description:
      "Thirty matched brilliants channel-set all the way round. The rails are polished so the band slides easily next to an engagement ring.",
    specs: [["Total weight", "2.10 ct"], ["Stones", "30 round brilliants"], ["Colour / Clarity", "F / VS"], ["Band width", "2.6 mm"]],
    sizes: RING_SIZES,
  },
  {
    slug: "orbit",
    name: "Orbit",
    collection: "eternity",
    model: "eternity",
    metal: "white",
    price: 5900,
    tagline: "White gold eternity",
    description:
      "The same matched channel setting as Perpetua, in white gold. The metal disappears, so the band reads as one continuous line of light.",
    specs: [["Total weight", "1.80 ct"], ["Stones", "30 round brilliants"], ["Colour / Clarity", "F / VS"], ["Band width", "2.4 mm"]],
    sizes: RING_SIZES,
  },
  {
    slug: "vesper",
    name: "Vesper",
    collection: "eternity",
    model: "eternity",
    metal: "rose",
    price: 5600,
    tagline: "Rose gold eternity",
    description: "Warm rose gold with bright white diamonds. A good match for vintage engagement rings and for stacking.",
    specs: [["Total weight", "1.60 ct"], ["Stones", "30 round brilliants"], ["Colour / Clarity", "G / VS"], ["Band width", "2.4 mm"]],
    sizes: RING_SIZES,
  },
  // Lumière
  {
    slug: "lumiere-drop",
    name: "Lumière Drop",
    collection: "lumiere",
    model: "pendant",
    metal: "yellow",
    price: 3800,
    tagline: "Oval diamond pendant",
    description:
      "An oval diamond in a fine rubbed-over setting, hung below a small round accent stone on an 18k trace chain. It sits just below the collarbone.",
    specs: [["Main stone", "0.70 ct oval"], ["Accent", "0.08 ct round"], ["Chain", "42 cm, adjustable to 40 cm"], ["Clasp", "Bolt ring"]],
  },
  {
    slug: "halo-hoops",
    name: "Halo Hoops",
    collection: "lumiere",
    model: "hoops",
    metal: "white",
    price: 4200,
    tagline: "Pavé hoop earrings",
    description: "Slim hoops pavé-set across the front with brilliant-cut diamonds, light enough to wear every day.",
    specs: [["Total weight", "0.56 ct"], ["Diameter", "18 mm"], ["Fastening", "Hinged snap"], ["Sold as", "Pair"]],
  },
  {
    slug: "rosee",
    name: "Rosée",
    collection: "lumiere",
    model: "drops",
    metal: "rose",
    price: 3200,
    tagline: "Diamond drop earrings",
    description: "A round stud with an oval drop hanging below it, set in rose gold. The drop moves freely, so it catches the light whenever you move.",
    specs: [["Total weight", "0.84 ct"], ["Drop length", "16 mm"], ["Fastening", "Butterfly back"], ["Sold as", "Pair"]],
  },
  // Heritage
  {
    slug: "heritage-bangle",
    name: "Heritage Bangle",
    collection: "heritage",
    model: "bangle",
    metal: "yellow",
    price: 7900,
    tagline: "Diamond-set gold bangle",
    description:
      "A heavy, comfort-fit bangle set across the top with eleven graduated diamonds. Forged from a single bar of recycled gold and finished by hand.",
    specs: [["Diamonds", "0.66 ct, graduated"], ["Width", "6 mm"], ["Inner diameter", "60 mm"], ["Weight", "approx. 28 g"]],
  },
  {
    slug: "maison-bangle",
    name: "Maison Bangle",
    collection: "heritage",
    model: "bangle",
    metal: "rose",
    price: 6800,
    tagline: "Rose gold bangle",
    description: "The Heritage bangle in rose gold. Warm and soft-edged, and it looks better the more it is worn.",
    specs: [["Diamonds", "0.66 ct, graduated"], ["Width", "6 mm"], ["Inner diameter", "60 mm"], ["Weight", "approx. 27 g"]],
  },
  {
    slug: "aurum-hoops",
    name: "Aurum Hoops",
    collection: "heritage",
    model: "hoops",
    metal: "yellow",
    price: 2900,
    tagline: "Gold hoop earrings",
    description: "Classic hoops in yellow gold with a line of pavé across the front. An everyday pair you can wear for years.",
    specs: [["Total weight", "0.42 ct"], ["Diameter", "18 mm"], ["Fastening", "Hinged snap"], ["Sold as", "Pair"]],
  },
];

export type Article = {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  read: string;
  excerpt: string;
  model: ModelKind;
  metal: Metal;
  image: ImgKey;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "how-to-choose-a-diamond",
    title: "How to choose a diamond",
    kicker: "Guide",
    date: "September 2026",
    read: "6 min",
    excerpt: "The four Cs explain what makes a diamond rare. They don't tell you which one you'll love. Here is how we choose.",
    model: "solitaire",
    metal: "white",
    image: "haloRing",
    body: [
      "Most guides to buying a diamond start with the four Cs: cut, colour, clarity and carat. They are a useful vocabulary, and every stone we sell comes with a grading report that uses them. But two diamonds with identical grades can look quite different on the hand, and choosing well means looking past the certificate.",
      "## Cut comes first",
      "Cut is the only one of the four Cs that is entirely down to people. A well-cut stone returns light to your eye; a poorly cut one leaks it out through the bottom. If you have a budget to spend, spend it here first. A slightly smaller stone with an excellent cut will almost always look brighter and larger than a bigger stone cut for weight.",
      "## Colour and clarity, in proportion",
      "Most people cannot tell D from G colour once a stone is set, especially in yellow or rose gold, which warms everything around it. Clarity matters even less: a VS2 stone is clean to the naked eye. We usually suggest spending less on these two grades and putting the difference towards cut or size.",
      "## Then, look",
      "The most useful thing you can do is look at stones side by side, in daylight and in lamplight, on your own hand. That is why our appointments are built around a tray of stones rather than a catalogue. Something in one of them will catch your eye, and that is the one to choose.",
    ],
  },
  {
    slug: "the-life-of-a-ring",
    title: "The life of a ring",
    kicker: "Atelier",
    date: "August 2026",
    read: "5 min",
    excerpt: "From a pencil line to the last polish: the forty or so hours it takes to make one of our engagement rings.",
    model: "trilogy",
    metal: "yellow",
    image: "benchExamine",
    body: [
      "Every ring we make starts in the same place: at the bench, with a pencil. We draw while you talk, and keep drawing until the proportions are right. Some commissions are settled in one sitting; others take several visits and a dozen sketches.",
      "## From drawing to metal",
      "Once the design is agreed we carve it in wax or model it digitally, then cast it in recycled gold or platinum. The casting is only a starting point. We forge and file it by hand, which makes the metal denser, stronger and better able to hold a stone for decades.",
      "## Setting",
      "Setting is the most delicate stage. Under the microscope, each claw is cut, shaped and rolled over the stone, a fraction of a millimetre at a time. A good setting is invisible: you see the diamond, not the metal holding it.",
      "## Finishing",
      "Finally the ring goes through seven stages of polishing, from coarse to mirror-bright, and a last inspection under daylight lamps. Only then is it boxed, ready to be collected.",
    ],
  },
  {
    slug: "caring-for-fine-jewellery",
    title: "Caring for fine jewellery",
    kicker: "Care",
    date: "July 2026",
    read: "4 min",
    excerpt: "A little care goes a long way. Our makers' advice for keeping gold and diamonds bright for a lifetime.",
    model: "eternity",
    metal: "rose",
    image: "ringsDish",
    body: [
      "Fine jewellery is made to be worn, and gold and diamonds are hard-wearing. But a few habits will keep your pieces looking their best and make sure stones stay secure for generations.",
      "## Everyday",
      "Take rings off for gardening, the gym and heavy lifting, and put perfume and lotion on before your jewellery rather than after. Lotions leave a film on diamonds that dulls their sparkle.",
      "## Cleaning at home",
      "A small bowl of warm water, a drop of washing-up liquid and a very soft toothbrush is all you need. Brush gently behind the stone where dust collects, rinse and pat dry with a lint-free cloth.",
      "## Once a year",
      "Bring your pieces back to us once a year. We check every claw, clean and re-polish at no charge for anything we have made. It takes about twenty minutes, and it is the best way to make sure a stone never goes missing.",
    ],
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const getPiece = (slug: string) => pieces.find((p) => p.slug === slug);
export const piecesIn = (slug: string) => pieces.filter((p) => p.collection === slug);
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const formatPrice = (p: number | null) =>
  p == null ? "Price on request" : `${CURRENCY}${p.toLocaleString("en-GB")}`;
