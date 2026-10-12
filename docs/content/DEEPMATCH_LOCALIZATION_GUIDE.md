# DEEPMATCH Localization Guide

## Package

`packages/i18n` (`@deepmatch/i18n`)

```
packages/i18n/locales/vi-VN/*.json
packages/i18n/locales/en-US/*.json
packages/i18n/src/{locales,translate,format,messages,index}.ts
```

Namespaces: `common`, `nav`, `auth`, `discovery`, `matching`, `chat`, `couple`, `profile`, `onboarding`, `commerce`, `booking`, `safety`, `ai`, `admin`, `errors`, `accessibility`, `notifications`, `marketing`, `memories`.

## Supported locales

| Locale | Role |
|---|---|
| `vi-VN` | Default product locale |
| `en-US` | International English + fallback for missing keys |

Adding a locale: copy `en-US` JSON files, translate naturally, register in `LOCALES`, extend `messages.ts`, run `npm run i18n:parity`.

## Runtime

| App | Detection | Persistence | Switcher |
|---|---|---|---|
| Web | Cookie `dm_locale` → `Accept-Language` → `vi-VN` | Cookie 1y | `LanguageSwitcher` (header / home) |
| Admin | Same cookie | Cookie | Admin header |
| Mobile | SecureStore → device locale → `vi-VN` | SecureStore | Me → Language |

Locale must not change mid-task unless the user switches it.

## API usage

```ts
import { t, getTranslator, formatCurrency } from "@deepmatch/i18n";

t("vi-VN", "discovery.like");
formatCurrency(199000, "vi-VN", "VND");
```

React:

```tsx
const t = useT();
return <Button>{t("discovery.like")}</Button>;
```

Interpolation: `{name}` and ICU-lite plurals `{count, plural, =0 {…} one {…} other {…}}`.

## Dates, numbers, currency

Use `formatDate`, `formatDateTime`, `formatNumber`, `formatCurrency`, `formatRelativeTime` from `@deepmatch/i18n` (Intl APIs). Prefer VND for `vi-VN` amounts unless the SKU currency differs.

## AI

Pass `locale` in assist input when available. Stub adapter and system prompts localize via `@deepmatch/i18n` + bilingual templates. Disclaimer key: `ai.disclaimer`.

## QA commands

```bash
npm run i18n:parity
npm run test -w @deepmatch/i18n
npm run typecheck
```
