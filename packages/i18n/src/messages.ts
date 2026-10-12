import type { Locale } from "./locales";
import type { MessageTree, MessagesByLocale } from "./translate";

import commonVi from "../locales/vi-VN/common.json";
import navVi from "../locales/vi-VN/nav.json";
import authVi from "../locales/vi-VN/auth.json";
import discoveryVi from "../locales/vi-VN/discovery.json";
import matchingVi from "../locales/vi-VN/matching.json";
import chatVi from "../locales/vi-VN/chat.json";
import coupleVi from "../locales/vi-VN/couple.json";
import profileVi from "../locales/vi-VN/profile.json";
import onboardingVi from "../locales/vi-VN/onboarding.json";
import commerceVi from "../locales/vi-VN/commerce.json";
import bookingVi from "../locales/vi-VN/booking.json";
import safetyVi from "../locales/vi-VN/safety.json";
import aiVi from "../locales/vi-VN/ai.json";
import adminVi from "../locales/vi-VN/admin.json";
import errorsVi from "../locales/vi-VN/errors.json";
import accessibilityVi from "../locales/vi-VN/accessibility.json";
import notificationsVi from "../locales/vi-VN/notifications.json";
import marketingVi from "../locales/vi-VN/marketing.json";
import memoriesVi from "../locales/vi-VN/memories.json";
import legalVi from "../locales/vi-VN/legal.json";
import faqVi from "../locales/vi-VN/faq.json";

import commonEn from "../locales/en-US/common.json";
import navEn from "../locales/en-US/nav.json";
import authEn from "../locales/en-US/auth.json";
import discoveryEn from "../locales/en-US/discovery.json";
import matchingEn from "../locales/en-US/matching.json";
import chatEn from "../locales/en-US/chat.json";
import coupleEn from "../locales/en-US/couple.json";
import profileEn from "../locales/en-US/profile.json";
import onboardingEn from "../locales/en-US/onboarding.json";
import commerceEn from "../locales/en-US/commerce.json";
import bookingEn from "../locales/en-US/booking.json";
import safetyEn from "../locales/en-US/safety.json";
import aiEn from "../locales/en-US/ai.json";
import adminEn from "../locales/en-US/admin.json";
import errorsEn from "../locales/en-US/errors.json";
import accessibilityEn from "../locales/en-US/accessibility.json";
import notificationsEn from "../locales/en-US/notifications.json";
import marketingEn from "../locales/en-US/marketing.json";
import memoriesEn from "../locales/en-US/memories.json";
import legalEn from "../locales/en-US/legal.json";
import faqEn from "../locales/en-US/faq.json";

export const NAMESPACES = [
  "common",
  "nav",
  "auth",
  "discovery",
  "matching",
  "chat",
  "couple",
  "profile",
  "onboarding",
  "commerce",
  "booking",
  "safety",
  "ai",
  "admin",
  "errors",
  "accessibility",
  "notifications",
  "marketing",
  "memories",
  "legal",
  "faq",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

function bundle(parts: Record<Namespace, MessageTree>): MessageTree {
  return parts;
}

export const messages: MessagesByLocale = {
  "vi-VN": bundle({
    common: commonVi,
    nav: navVi,
    auth: authVi,
    discovery: discoveryVi,
    matching: matchingVi,
    chat: chatVi,
    couple: coupleVi,
    profile: profileVi,
    onboarding: onboardingVi,
    commerce: commerceVi,
    booking: bookingVi,
    safety: safetyVi,
    ai: aiVi,
    admin: adminVi,
    errors: errorsVi,
    accessibility: accessibilityVi,
    notifications: notificationsVi,
    marketing: marketingVi,
    memories: memoriesVi,
    legal: legalVi,
    faq: faqVi,
  }),
  "en-US": bundle({
    common: commonEn,
    nav: navEn,
    auth: authEn,
    discovery: discoveryEn,
    matching: matchingEn,
    chat: chatEn,
    couple: coupleEn,
    profile: profileEn,
    onboarding: onboardingEn,
    commerce: commerceEn,
    booking: bookingEn,
    safety: safetyEn,
    ai: aiEn,
    admin: adminEn,
    errors: errorsEn,
    accessibility: accessibilityEn,
    notifications: notificationsEn,
    marketing: marketingEn,
    memories: memoriesEn,
    legal: legalEn,
    faq: faqEn,
  }),
};

export function getMessages(locale: Locale): MessageTree {
  return messages[locale];
}
