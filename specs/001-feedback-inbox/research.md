# Research: Feedback Inbox

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-17

All findings were checked against the installed versions in `apps/admin` (Next.js 16.4.6, React
19.3.0, Tailwind CSS 4.3.3, Node 24, npm 11) and the bundled Next.js docs in
`apps/admin/node_modules/next/dist/docs/`, as required by `apps/admin/AGENTS.md`.

## R1. Where the inbox lives and how the page is split

- **Decision**: The inbox replaces the Next.js starter page at `apps/admin/app/page.tsx`. The
  page stays a Server Component that imports the mock data and passes it as a prop to one
  Client Component container, `FeedbackInbox` (`"use client"`). All interaction state lives in
  that container; every other inbox component is presentational and receives data and
  callbacks via props.
- **Rationale**: Filtering, selection, reply text and status changes are browser state, so they
  need a Client Component. Keeping the data import in the page satisfies Constitution V
  (components must not import mock data) and makes the Convex switch a change to the page or
  container only. The admin app has no other pages yet, so the inbox is the natural home view.
- **Alternatives considered**: A separate `/innboks` route (adds routing with no benefit until
  there is navigation); making the whole page a Client Component (would force the mock-data
  import into a client module, violating Constitution V).

## R2. Showing relative times ("2 min siden") with Cache Components enabled

- **Decision**: Read the current time only in the browser through a small `useNow()` hook built
  on React's `useSyncExternalStore`: the server snapshot is `null`, the client snapshot is the
  current time rounded down to the minute, and a 60-second interval keeps it fresh. While `now`
  is `null` (pre-render and the first hydration pass), rows show the absolute short date; after
  hydration they switch to the relative label. All time formatting is pure functions that take
  `now` as an argument.
- **Rationale**: `next.config.ts` enables `cacheComponents`, and the bundled docs state that with
  Cache Components Next.js also pre-renders Client Components; reading `Date.now()` during that
  render raises a `blocking-prerender-current-time` error. The project's ESLint config enables
  `react-hooks/purity` (no `Date.now()` in render) and `react-hooks/set-state-in-effect` (no
  `setState` straight inside `useEffect`), which rules out the usual
  `useEffect(() => setNow(Date.now()))` pattern. `useSyncExternalStore` with a `null` server
  snapshot avoids all three problems without a dependency.
- **Alternatives considered**: `await connection()` plus `<Suspense>` to render per request
  (makes the page dynamic and still risks hydration mismatches when the minute changes between
  server and browser); `"use cache"` on the time (would freeze "now" at build time); a date
  library such as date-fns (unneeded: `Intl` covers Danish formatting, Constitution IV).

## R3. Danish date and time formatting

- **Decision**: Use the built-in `Intl.DateTimeFormat` with locale `da-DK` and a fixed
  `timeZone: "Europe/Copenhagen"` for every absolute date and time. Relative labels follow these
  rules, with `now` passed in:

  | Age of ticket | Label |
  |---------------|-------|
  | under 1 minute | `Lige nu` |
  | 1–59 minutes | `{n} min siden` |
  | 1–23 hours, same calendar day | `{n} t siden` |
  | previous calendar day | `I går` |
  | older, same year | short date, e.g. `26. okt.` |
  | older, other year | short date with year, e.g. `26. okt. 2025` |

  Full timestamps (panel header, context table, sent reply) use date and time, e.g.
  `28. okt. 2026, 11.42` (Intl's Danish output uses `.` as the time separator).
- **Rationale**: A fixed time zone gives identical output during pre-render (server time zone)
  and in the browser, so absolute dates never cause hydration mismatches. The team is Danish, so
  Copenhagen time is the expected reference. Node 24 ships full ICU, so tests produce the same
  strings as browsers.
- **Alternatives considered**: The viewer's local time zone (mismatch between server and browser
  render); `Intl.RelativeTimeFormat` (its Danish output, e.g. "for 2 minutter siden", does not
  match the compact style in the design).

## R4. Test setup (Vitest + Testing Library + jsdom)

- **Decision**: Follow the bundled Next.js Vitest guide (`02-guides/testing/vitest.md`): install
  `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`
  and `vite-tsconfig-paths` as dev dependencies, add `vitest.config.mts` with the React and
  tsconfig-paths plugins and `environment: "jsdom"`, and a `"test": "vitest"` script. Add
  `@testing-library/user-event` for keyboard tests. Add a `vitest.setup.ts` that calls
  Testing Library's `cleanup()` after each test. Tests sit next to the code they test
  (`*.test.ts` / `*.test.tsx`).
- **Rationale**: Constitution VI and the Technology section sanction Vitest, Testing Library and
  jsdom. `@vitejs/plugin-react` and `vite-tsconfig-paths` are required by the official setup (JSX
  transform and the `@/*` path alias). `user-event` is part of Testing Library and is the only
  way to test FR-024 realistically: `fireEvent` cannot move focus with Tab. Without Vitest
  globals, Testing Library does not unmount between tests automatically, hence the setup file.
  `vi.setSystemTime()` controls `Date.now()` in tests, so `useNow()` needs no test-only props.
- **Alternatives considered**: `@testing-library/jest-dom` matchers (convenient but not needed;
  plain `expect` with Testing Library queries is enough, Constitution IV); Vitest `globals: true`
  (hides imports and needs extra TypeScript config; explicit imports match the guide).

## R5. Accessible controls without a component library

- **Decision**: Build every control from native elements styled with the existing classes:
  - Ticket rows: a `<button>` inside each `<li>` (`.list-row`), with `aria-current="true"` on the
    open ticket.
  - All/Done switch: two `<button>`s with `aria-pressed` inside `.segmented`.
  - Category filter: a native `<select>` styled as `.pill-button`.
  - Sort: a single toggle `<button>` (`.pill-button`) that flips between "Nyeste først" and
    "Ældste først".
  - Confirmations: an inline message with `role="status"` in the details panel.
  - Focus: one global `:focus-visible` rule in `globals.css` (outline in the existing `--brand`
    color).
- **Rationale**: Native buttons and selects give Tab, Enter and Space behavior for free (FR-024)
  and need no dependency (Constitution IV). The design only shows the closed state of the
  category control, so a native dropdown list does not conflict with Figma. `role="status"`
  announces confirmations to screen readers without a toast library.
- **Alternatives considered**: A headless UI library (Radix, Headless UI) for a custom dropdown
  (new dependency without a requirement that needs it); a toast library for confirmations.

## R6. Icons and assets from Figma

- **Decision**: During implementation, fetch the icons for the inbox (node `323:1906`) and the
  filter controls (`323:1907`, `323:1908`, `121:645`) with the Figma MCP `get_design_context`,
  download each SVG into `apps/admin/public/icons/`, and render them with `next/image` at their
  native size. Category icons (bug, lightbulb, speech bubble) are the 31 px colored SVGs from
  Figma, so their colors come with the asset.
- **Rationale**: The Figma asset URLs expire after 7 days, so they must be downloaded at
  implementation time, not stored in the plan. `next/image` automatically serves `.svg` sources
  unoptimized (bundled docs, Image component, `dangerouslyAllowSVG`), so no config change is
  needed. The Figma workflow forbids redrawing or inlining icon paths.
- **Alternatives considered**: An icon library such as lucide-react (would not match the design
  exactly and adds a dependency); inline SVG components (forbidden by the Figma workflow).

## R7. Layout values missing from `globals.css`

- **Decision**: Add four layout tokens measured in Figma to `apps/admin/app/globals.css`:
  `--inbox-height: 769px`, `--inbox-list-width: 520px`, `--inbox-gap: 17px` and
  `--inbox-toolbar-gap: 12px` (Figma shows 11–13 px between the filter controls and above the
  cards), plus the global
  `:focus-visible` rule from R5. Everything else uses the existing tokens and component classes
  (`.card`, `.list-row`, `.badge`, `.segmented`, `.pill-button`, `.chip`, `.avatar`,
  `.attachment`, `.table-box`, `.textarea`, `.button`, text classes).
- **Rationale**: Constitution I requires missing values to be taken from Figma and added as
  tokens, never hard-coded in components.
- **Alternatives considered**: Tailwind arbitrary values such as `w-[520px]` in components
  (hard-coding, forbidden by Constitution I).

## R8. Danish interface text

- **Decision**: Use this copy (FR-020). Category names are fixed by the clarification session.

  | Design (English) | Danish |
  |------------------|--------|
  | All {n} / Done {n} | Alle {n} / Færdig {n} |
  | Category: All | Kategori: Alle (options: Alle, Fejl, Forslag, Generel feedback) |
  | Newest first / Oldest first | Nyeste først / Ældste først |
  | New / In progress / Done (badges) | Ny / I gang / Færdig |
  | Attachments (2) | Vedhæftede filer (2) |
  | Context (sent automatically) | Kontekst (sendt automatisk) |
  | Platform / Page / User / Browser & OS / Screen size / Time | Platform / Side / Bruger / Browser og OS / Skærmstørrelse / Tidspunkt |
  | Sent {date} | Sendt {date} |
  | Reply field label | Svar kunden – du kan ændre i det automatiske svar |
  | Create GitHub issue | Opret GitHub-issue |
  | Done/send | Færdig/send |
  | (sent reply heading) | Sendt svar · {date} |
  | (confirmations) | Svaret er sendt. / GitHub-issue er oprettet. |
  | (empty list) | Ingen feedback matcher filtrene. |
  | (empty panel) | Vælg en feedback i listen for at se detaljerne. |

- **Rationale**: Keeps the wording of the design while meeting the Danish-only rule. "Færdig"
  is used for both the filter and the badge, so the same word always means the same status.
- **Alternatives considered**: Keeping "Bug" and "Done" in English (violates FR-020 and the
  constitution).

## R9. Shape of the data types

- **Decision**: Define all shared types in one module, `apps/admin/lib/types.ts`, shaped like
  the documents of a planned Convex `feedback` table: `_id` (string) and `_creationTime`
  (milliseconds) as Convex adds them, string-literal unions for category, status and platform,
  and the sender, context, attachments and reply embedded in the ticket. See
  [data-model.md](data-model.md).
- **Rationale**: Constitution II requires one source of types that mirrors the planned schema.
  Using Convex's own field names (`_id`, `_creationTime`) means the components keep working when
  the handwritten types are replaced by `Doc<"feedback">` from `convex/_generated/dataModel`.
- **Alternatives considered**: Separate tables for senders and attachments now (more joins to
  mock with no current benefit; can be split when the real schema is written).
