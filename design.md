# Design — Ôn luyện thi BTCB 2026

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal (functional app/dashboard, not marketing)

## Macrostructure family
Single family — this app has no marketing pages, every route is a
functional "app" screen (auth forms, quiz runner, tables, admin forms).

- App pages: **App Dashboard** — sticky top bar (navy) + content column
  (`max-w-6xl`) of cards/forms/tables + fixed bottom tab bar on mobile
  (< 768px) replacing the old horizontal-scroll sub-nav.

## Theme
- `--color-paper`  #f6f5fb (warm near-white app background, not pure white)
- `--color-card`   #ffffff (card surfaces sit on the paper tone)
- `--color-ink`    #1c2440 (body text)
- brand ramp (indigo-navy, replaces the generic Tailwind blue-600 default):
  50 #eef1fb · 100 #dce3f6 · 200 #b9c7ed · 300 #8fa3e0 · 400 #647ed0 ·
  500 #4760bd · 600 #3a4da3 (primary) · 700 #2f3d84 · 800 #28336c ·
  900 #232c59 · 950 #181e3f
- gold accent ramp (achievement/highlight — CTAs on the dark navbar, medal
  rows, focus/attention moments): 50 #fdf7e8 · 100 #faecc4 · 200 #f3d783 ·
  300 #e9bd4c · 400 #d9a52e (primary) · 500 #bd8a1f · 600 #976c19
- correct: bg #e3f6ea · border #2f9e5c · text #1a7a45
- wrong: bg #fbe9e7 · border #d94f3d · text #b23b2c
- Tailwind's default `slate` scale is kept for secondary/tertiary text and
  borders — it already reads clean against the new palette.

## Typography
- Display (headings h1–h3): Be Vietnam Pro, weight 700/800 — chosen because
  it's designed for full Vietnamese diacritic coverage and has real
  character vs. the system-font default the app shipped with.
- Body: Inter, weight 400/500/600 — high legibility at small sizes for quiz
  text and admin tables on mobile; also full Vietnamese subset support.
- Both loaded via `next/font/google` with `subsets: ["vietnamese", "latin"]`
  in `src/app/layout.tsx`, exposed as `--font-display` / `--font-body`.
- Headings get the display face automatically via `h1,h2,h3` in
  `globals.css` — individual pages don't need a font className.

## Spacing / radius
- Existing Tailwind default spacing scale, unchanged.
- Cards: `rounded-2xl` (was `rounded-xl`) for a softer, less generic edge.
- Buttons/inputs: `rounded-lg`, `min-h-[42px]` — deliberate 42px+ touch
  target for mobile tap comfort (the old inputs were ~36px).

## Motion
- Buttons: `active:translate-y-px` (press feedback), 150ms colour/opacity
  transitions only — no layout-property animation.
- No scroll-reveal / entrance animation anywhere — this is a utility app,
  not a marketing page; motion is feedback-only.
- Reduced-motion: nothing here needs a reduced-motion override since there's
  no spatial motion to begin with.

## Microinteractions stance
- Instant, no-delay right/wrong colour feedback in practice mode (this is a
  product requirement, not a Hallmark default — the user needs the
  correct/wrong ring the millisecond they tap an option).
- Silent success elsewhere (no celebratory toasts).
- `focus-visible` ring on every interactive element, ≥3px offset, shown
  instantly (never animated in).

## CTA voice
- Primary: solid `brand-600` fill, white text, `rounded-lg`.
- On the dark navbar specifically: solid `gold-400` fill, `brand-900` text
  (brand-600 doesn't stand out against the navy bar, gold does).
- Secondary: white fill, `brand-900` text, 1px slate ring.
- Danger (delete question, submit warning): solid `wrong-text` fill, white
  text.

## Nav
Sticky top bar, `bg-brand-900`, white/gold text, gold logo chip. Desktop
shows inline links; **mobile (< 768px) uses a fixed bottom tab bar**
(`src/components/MobileTabBar.tsx`) with icon + label per section — replaces
the old horizontal-scrolling link row, which is the direct answer to "make
it work well on phones too". Bottom tab bar only renders for signed-in users
(same routes it used to show in the old mobile sub-nav).

## Icons
Emoji icons (📘📝🏆📚👥📊 etc.) replaced with a small hand-built stroke-SVG
set in `src/components/Icon.tsx` (Book, Pencil, Trophy, Users, Chart, Doc,
Clock, Target, Lock, Upload, Gear) on the highest-traffic screens (home,
navbar, mobile tab bar, admin dashboard, exam intro). Medal emoji (🥇🥈🥉)
on the leaderboard were kept — universally understood, not a "slop" tell.
Remaining lower-traffic admin sub-pages still use their original emoji;
swap them to the same Icon set later if desired.

## What pages MUST share
- The navy navbar + gold logo chip / CTA.
- The brand + gold token ramps (no other accent colour introduced).
- Be Vietnam Pro (headings) + Inter (body).
- `.card` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.input`
  component classes in `globals.css` — pages must keep using these, not
  hand-roll new button/card styles.

## What pages MAY differ on
- Card grid layout (2-col, 3-col, table) per page's content shape.
- Whether an icon accompanies a heading.

## Where the tokens live
This is a Tailwind (not raw-CSS-token) project, so the token source of
truth is `tailwind.config.ts` (`theme.extend.colors.brand` / `.gold` /
`.correct` / `.wrong`, `theme.extend.fontFamily`, `theme.extend.boxShadow`)
plus the `@layer components` block in `src/app/globals.css`. A separate
`tokens.css` would be dead weight here since nothing would import it —
Tailwind's config *is* the portable format for this stack.
