export type UserMode = "solo" | "has_partner";

export type PinLayer = "visited" | "wishlist" | "milestone";

export type AdminRole =
  | "owner"
  | "admin"
  | "moderator"
  | "advisor"
  | "support";

export interface DiscoveryProfile {
  userId: string;
  displayName: string;
  birthDate: string;
  fuzzyRegion: string;
  goals: string[];
  values: string[];
  interests: string[];
  dealbreakers: string[];
  discoveryOptIn: boolean;
  hiddenFromDiscovery: boolean;
}

export interface MatchPreferences {
  userId: string;
  minAge: number;
  maxAge: number;
  regions: string[];
  requiredGoals: string[];
  excludedUserIds: string[];
}

export interface RankedCandidate {
  userId: string;
  score: number;
  reasons: string[];
}

export interface MutualGateInput {
  aLikesB: boolean;
  bLikesA: boolean;
}
