/** Lifestyle Information Architecture — 11 modules → commercial + utility groups. */

export type LifestyleLink = {
  href: string;
  titleKey: string;
  descKey: string;
  /** Optional static label when title is a brand name */
  title?: string;
};

export type LifestyleGroup = {
  id: string;
  titleKey: string;
  hintKey: string;
  items: LifestyleLink[];
};

/** Commercial marketplace pillars (catalog-backed). */
export const LIFESTYLE_COMMERCIAL: LifestyleGroup = {
  id: "commercial",
  titleKey: "commerce.groupCommercial",
  hintKey: "commerce.groupCommercialHint",
  items: [
    {
      href: "/lifestyle/gift",
      title: "DeepGift",
      titleKey: "commerce.pillarGift",
      descKey: "commerce.pillarGift",
    },
    {
      href: "/lifestyle/fashion",
      title: "DeepStyle",
      titleKey: "commerce.pillarFashion",
      descKey: "commerce.pillarFashion",
    },
    {
      href: "/lifestyle/beauty",
      title: "DeepBeauty",
      titleKey: "commerce.pillarBeauty",
      descKey: "commerce.pillarBeauty",
    },
    {
      href: "/lifestyle/venue",
      title: "DeepDate",
      titleKey: "commerce.pillarVenue",
      descKey: "commerce.pillarVenue",
    },
    {
      href: "/lifestyle/travel",
      title: "DeepTravel",
      titleKey: "commerce.pillarTravel",
      descKey: "commerce.pillarTravel",
    },
  ],
};

/** Support utilities (safety, AI, cart/orders). */
export const LIFESTYLE_UTILITIES: LifestyleGroup = {
  id: "utilities",
  titleKey: "commerce.groupUtilities",
  hintKey: "commerce.groupUtilitiesHint",
  items: [
    {
      href: "/safe",
      title: "DeepSafe",
      titleKey: "commerce.pillarSafe",
      descKey: "commerce.pillarSafe",
    },
    {
      href: "/lifestyle/safety",
      titleKey: "commerce.pillarSafeCatalog",
      descKey: "commerce.pillarSafeCatalog",
    },
    {
      href: "/lifestyle/cart",
      titleKey: "commerce.cartDemo",
      descKey: "commerce.cartIntro",
    },
    {
      href: "/lifestyle/orders",
      titleKey: "commerce.orders",
      descKey: "commerce.pillarOrders",
    },
    {
      href: "/ai",
      titleKey: "ai.title",
      descKey: "commerce.pillarAi",
    },
    {
      href: "/ai/deepmind",
      title: "DeepMind",
      titleKey: "commerce.pillarDeepmind",
      descKey: "commerce.pillarDeepmind",
    },
  ],
};

export const LIFESTYLE_COUPLE_LINKS: LifestyleLink[] = [
  {
    href: "/couple",
    titleKey: "commerce.coupleSpace",
    descKey: "commerce.coupleSpaceDesc",
  },
  {
    href: "/services",
    titleKey: "commerce.companionLink",
    descKey: "commerce.companionLinkDesc",
  },
  {
    href: "/places/map",
    titleKey: "commerce.dateMapLink",
    descKey: "commerce.dateMapLinkDesc",
  },
];
