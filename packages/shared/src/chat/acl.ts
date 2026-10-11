export interface ChatAccessInput {
  isAuthenticated: boolean;
  isMutualMatch: boolean;
  isParticipant: boolean;
  isBlockedEitherWay: boolean;
  chatFlagEnabled: boolean;
  userSuspended: boolean;
}

export function canAccessChat(input: ChatAccessInput): {
  allowed: boolean;
  reason: string;
} {
  if (!input.chatFlagEnabled) {
    return { allowed: false, reason: "ff_chat_disabled" };
  }
  if (!input.isAuthenticated) {
    return { allowed: false, reason: "unauthenticated" };
  }
  if (input.userSuspended) {
    return { allowed: false, reason: "suspended" };
  }
  if (!input.isMutualMatch) {
    return { allowed: false, reason: "mutual_required" };
  }
  if (!input.isParticipant) {
    return { allowed: false, reason: "not_participant" };
  }
  if (input.isBlockedEitherWay) {
    return { allowed: false, reason: "blocked" };
  }
  return { allowed: true, reason: "ok" };
}
