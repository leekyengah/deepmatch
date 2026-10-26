/**
 * Presentation fixtures for Member Center dashboard visuals.
 * Live APIs / DB remain source of truth when available; fixtures fill empty UI.
 */

export type MeFixtureProfile = {
  displayName: string;
  headline: string;
  location: string;
  age: number;
  avatarUrl: string;
  coverUrl: string;
  verified: boolean;
  completionPercent: number;
  membershipLabel: string;
  membershipTier: "explorer" | "plus" | "premium";
  connectionsCount: number;
  upcomingDatesCount: number;
  matchesActive: number;
  journeyStep: number;
  journeyTotal: number;
  connectionAvatars: string[];
  matchPreviews: string[];
};

export const ME_FIXTURE: MeFixtureProfile = {
  displayName: "Lan Anh",
  headline: "Đang tìm một kết nối chân thật và sâu sắc",
  location: "Quận 1, TP. Hồ Chí Minh",
  age: 28,
  avatarUrl: "/fixtures/me/avatar.jpg",
  coverUrl: "/fixtures/me/cover.jpg",
  verified: true,
  completionPercent: 82,
  membershipLabel: "DeepMatch Plus",
  membershipTier: "plus",
  connectionsCount: 12,
  upcomingDatesCount: 2,
  matchesActive: 3,
  journeyStep: 4,
  journeyTotal: 6,
  connectionAvatars: [
    "/fixtures/me/conn-1.jpg",
    "/fixtures/me/conn-2.jpg",
    "/fixtures/me/match-1.jpg",
  ],
  matchPreviews: ["/fixtures/me/match-1.jpg", "/fixtures/me/match-2.jpg"],
};

export type MeNextAction = {
  id: string;
  titleKey: string;
  descKey: string;
  href: string;
  tone: "primary" | "secondary" | "accent";
};

export const ME_NEXT_ACTIONS: MeNextAction[] = [
  {
    id: "verify",
    titleKey: "profile.memberCenter.actions.verifyTitle",
    descKey: "profile.memberCenter.actions.verifyDesc",
    href: "/me/media",
    tone: "primary",
  },
  {
    id: "deep",
    titleKey: "profile.memberCenter.actions.deepTitle",
    descKey: "profile.memberCenter.actions.deepDesc",
    href: "/me/deep",
    tone: "secondary",
  },
  {
    id: "date",
    titleKey: "profile.memberCenter.actions.dateTitle",
    descKey: "profile.memberCenter.actions.dateDesc",
    href: "/me/journey",
    tone: "accent",
  },
];

export type MeManagementItem = {
  href: string;
  titleKey: string;
  descKey: string;
};

export type MeManagementGroup = {
  id: string;
  titleKey: string;
  items: MeManagementItem[];
};

export const ME_MANAGEMENT_GROUPS: MeManagementGroup[] = [
  {
    id: "profile",
    titleKey: "profile.memberCenter.groups.profile",
    items: [
      {
        href: "/me/edit",
        titleKey: "profile.edit",
        descKey: "profile.memberCenter.items.editDesc",
      },
      {
        href: "/me/media",
        titleKey: "profile.mediaGateTitle",
        descKey: "profile.memberCenter.items.mediaDesc",
      },
      {
        href: "/me/deep",
        titleKey: "profile.deep",
        descKey: "profile.memberCenter.items.deepDesc",
      },
      {
        href: "/me/understand",
        titleKey: "profile.memberCenter.items.understand",
        descKey: "profile.memberCenter.items.understandDesc",
      },
    ],
  },
  {
    id: "match",
    titleKey: "profile.memberCenter.groups.match",
    items: [
      {
        href: "/me/preferences",
        titleKey: "profile.memberCenter.items.preferences",
        descKey: "profile.memberCenter.items.preferencesDesc",
      },
      {
        href: "/me/journey",
        titleKey: "profile.memberCenter.items.journey",
        descKey: "profile.memberCenter.items.journeyDesc",
      },
      {
        href: "/discover",
        titleKey: "profile.memberCenter.items.discover",
        descKey: "profile.memberCenter.items.discoverDesc",
      },
      {
        href: "/likes",
        titleKey: "profile.memberCenter.items.matches",
        descKey: "profile.memberCenter.items.matchesDesc",
      },
    ],
  },
  {
    id: "membership",
    titleKey: "profile.memberCenter.groups.membership",
    items: [
      {
        href: "/me/premium",
        titleKey: "profile.premiumPlan",
        descKey: "profile.memberCenter.items.premiumDesc",
      },
      {
        href: "/me/orders",
        titleKey: "profile.memberCenter.items.orders",
        descKey: "profile.memberCenter.items.ordersDesc",
      },
      {
        href: "/checkout/confirm",
        titleKey: "profile.memberCenter.items.checkout",
        descKey: "profile.memberCenter.items.checkoutDesc",
      },
    ],
  },
  {
    id: "safety",
    titleKey: "profile.memberCenter.groups.safety",
    items: [
      {
        href: "/safe",
        titleKey: "profile.memberCenter.items.safety",
        descKey: "profile.memberCenter.items.safetyDesc",
      },
      {
        href: "/me/privacy",
        titleKey: "profile.privacy",
        descKey: "profile.memberCenter.items.privacyDesc",
      },
    ],
  },
  {
    id: "account",
    titleKey: "profile.memberCenter.groups.account",
    items: [
      {
        href: "/me/account",
        titleKey: "profile.account",
        descKey: "profile.memberCenter.items.accountDesc",
      },
      {
        href: "/me/history",
        titleKey: "profile.history",
        descKey: "profile.memberCenter.items.historyDesc",
      },
    ],
  },
];
