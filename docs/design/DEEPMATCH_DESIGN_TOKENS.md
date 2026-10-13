# DeepMatch Design Tokens — Responsive & Full Frame (v4 proposal)

| Field | Value |
|---|---|
| Date | 2026-10-13 |
| Supersedes | Pink values in `docs/p1/DM-017-design-tokens.md` for **web product UI** |
| Source of truth (color v3) | `apps/web/src/app/globals.css` |
| Status | **PROPOSED** — apply in code after Founder GO |

---

## 1. Color (unchanged Premium v3)

| Token | Value | Role |
|---|---|---|
| `--dm-primary` | `#6B2D3C` | CTA, active nav, mine bubbles |
| `--dm-primary-hover` | `#54212F` | Hover |
| `--dm-deep` | `#472025` | Strong headings |
| `--dm-blush` | `#F4E9E4` | Soft tint |
| `--dm-canvas` | `#F7F3EE` | App background |
| `--dm-panel` | `#FAF6F3` | Sidebar / elevated panel |
| `--dm-surface` | `#FFFCF9` | Cards / theirs bubbles |
| `--dm-champagne` | `#A88A62` | Premium accent |
| `--dm-gold` | `#96734B` | Secondary accent |
| `--dm-ink` | `#241A1C` | Body |
| `--dm-muted` | `#706763` | Secondary text |
| `--dm-line` | `#E8DCD4` | Borders |
| `--dm-good` | `#2F7D4A` | Success |
| `--dm-danger` | `#A63E52` | Destructive / unread |

Admin should migrate to the same set (P2). Mobile already mirrors via `constants/theme.ts`.

---

## 2. Breakpoints (DeepMatch matrix)

Named for QA; map onto Tailwind `screens`:

| Name | Min width | Tailwind key | Typical device |
|---|---|---|---|
| `xxs` | 320px | custom | very small phones |
| `xs` | 360px | custom | Android compact |
| `sm` | 390px | override* | iPhone 12/13/14 |
| `md` | 768px | keep | tablet / sidebar on |
| `lg` | 1024px | keep | laptop |
| `xl` | 1280px | keep | desktop |
| `2xl` | 1440px | override* | design desktop |
| `3xl` | 1920px | custom | large desktop |
| `4xl` | 2560px | custom | ultrawide |

\*Changing default `sm` from 640→390 is **breaking** for existing `sm:` classes. **Recommendation:** keep Tailwind defaults; add **aliases** `dm-xs`…`dm-4xl` for new code + QA matrix, migrate hotspots gradually. Do **not** mass-rename overnight.

QA must still probe: 320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920, 2560 (+ landscape).

---

## 3. Containers / Full Frame

Full Frame = viewport width used for chrome; **content** capped for readability.

| Token | Value | Usage |
|---|---|---|
| `--dm-frame-app` | `min(100%, 1440px)` | Discover, Chat, AI, Couple hubs |
| `--dm-frame-wide` | `min(100%, 1280px)` | Services, Lifestyle marketplace |
| `--dm-frame-standard` | `min(100%, 1120px)` | Me, settings groups |
| `--dm-frame-narrow` | `min(100%, 720px)` | Forms, checkout, legal prose |
| `--dm-frame-prose` | `min(100%, 680px)` | Long text |
| `--dm-gutter` | `clamp(16px, 2.5vw, 32px)` | Horizontal page padding |
| `--dm-sidebar` | `272px` | Desktop nav width |

**Rules**

- One content max-width per page (PageFrame). Avoid nested `max-w-*` that fights AppShell.
- Ultrawide (1920–2560): gutters grow; content stays on `--dm-frame-*`; no stretch of text lines past frame.
- Forbidden: `zoom`, page-level `transform: scale()` to “fit” UI.

Utility (proposed): `.dm-page-frame`, `.dm-page-frame--narrow`, etc.

---

## 4. Spacing scale

Keep 4px base. Promote named CSS vars for shared chrome:

| Token | px |
|---|---|
| `--dm-space-1` … `--dm-space-10` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| `--dm-header-h` | 72 |
| `--dm-mobile-nav-h` | 56 + `env(safe-area-inset-bottom)` |
| `--dm-touch` | 44 (min touch target) |

---

## 5. Radius & shadow

| Token | Value |
|---|---|
| `--dm-radius-sm` | 8px |
| `--dm-radius-md` | 12px |
| `--dm-radius-lg` | 16px |
| `--dm-radius-xl` | 22px |
| `--dm-shadow` | `0 12px 40px rgba(36, 26, 28, 0.08)` |

Prefer `rounded-dm` / `rounded-dm-xl` over raw `rounded-[22px]`.

---

## 6. Typography

| Role | Font | Size guidance |
|---|---|---|
| Display | Fraunces / `--font-display` | `clamp(1.75rem, 1.2rem + 2vw, 2.75rem)` |
| Editorial | Lora / `--font-editorial` | `clamp(0.95rem, 0.9rem + 0.4vw, 1.125rem)` |
| Body | Be Vietnam Pro | 14–16px; line-height 1.5–1.65 |
| UI label | Be Vietnam Pro | 12–13px semibold |

Do not ship Inter for brand surfaces.

---

## 7. Media

| Token | Value | Rule |
|---|---|---|
| `--dm-aspect-portrait` | `3 / 4` | Profile / discover cards |
| `--dm-aspect-landscape` | `16 / 10` | Memories / lifestyle hero (non-portrait) |
| `--dm-aspect-video` | `16 / 9` | Video unless source metadata differs |
| object-fit | `cover` | Portraits; never stretch |
| Video max | 30s (product policy; unchanged) | — |

Component: `MediaFrame` with `ratio="portrait" | "landscape" | "video"`.

---

## 8. Navigation & safe area

```css
padding-bottom: calc(var(--dm-mobile-nav-h) + env(safe-area-inset-bottom, 0px));
```

- Desktop: sidebar `--dm-sidebar`, sticky.
- Mobile: 5-tab bar (ADR-11); each tab min 44×44 hit area.
- Keyboard: chat composer `position: sticky` / visual viewport — no cover of send control (P1 Chat pass).

---

## 9. Grid recipes

| Context | Mobile | md+ |
|---|---|---|
| Discover cards | 2-col | 3–4 col |
| Chat | stack panes | 3-col hub / thread / context |
| Me groups | 1-col | 2-col |
| Services packages | 1-col | 2–3 col |

Prefer CSS grid/flex + `minmax(0,1fr)`; use container queries only where a card is reused in narrow sidebars.

---

## 10. Web ↔ App sync

| Layer | Web | Mobile |
|---|---|---|
| Color | CSS vars | `theme.ts` (already aligned) |
| Spacing / touch | CSS vars | RN numbers mirrored in `theme.ts` export |
| Safe area | `env(safe-area-inset-*)` | `SafeAreaView` / `useSafeAreaInsets` |
| Aspect 3:4 | `MediaFrame` | `AspectRatio` / fixed style |
| Do not share | DOM layout | Native stack / keyboard |

---

## 11. Anti-patterns (reject in review)

1. Page-level zoom/scale to fit.
2. Fixed `width: 1440px` without `max-width: 100%`.
3. Nested competing max-widths.
4. Hardcoded hex when `dm-*` exists.
5. Portrait images without 3:4 + cover.
6. Touch targets &lt; 44px on primary actions.
