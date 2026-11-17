# Implementation Plan: Feedback Inbox

**Branch**: `inbox` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-feedback-inbox/spec.md`

## Summary

Build the feedback inbox for the admin app: a filterable, sortable list of feedback tickets and a
details panel with attachments, captured context, a one-time reply and a simulated "create GitHub
issue" action, all driven by mock data and matching the Figma design in Danish.

Technical approach: `apps/admin/app/page.tsx` stays a Server Component that passes mock data to a
single Client Component container (`Inbox`) holding all interaction state in a pure
reducer. All other components are presentational and built from native, keyboard-accessible
elements styled with the existing `globals.css` classes. Time is read only in the browser via a
`useSyncExternalStore` hook, because Cache Components pre-renders client components
([research R2](research.md#r2-showing-relative-times-2-min-siden-with-cache-components-enabled)).
Vitest + Testing Library + jsdom are added for logic and component tests.

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents` and
`partialPrefetching` enabled), Tailwind CSS 4.3.3 plus `apps/admin/app/globals.css`. No new
runtime dependencies.

**Storage**: None. Mock data in `apps/admin/lib/mock-feedback.ts`; changes live in client state
for the session only.

**Testing**: Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`)
+ jsdom, set up as in the bundled Next.js Vitest guide ([research R4](research.md#r4-test-setup-vitest--testing-library--jsdom)).

**Target Platform**: Desktop browsers (current Chrome, Safari, Firefox, Edge); small screens out
of scope.

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: Filtering, sorting and opening a ticket update in under 0.5 s with the
full mock data set (SC-005); trivially met with in-memory data of ~15–65 tickets.

**Constraints**: No reading the clock during render (Cache Components and the
`react-hooks/purity` lint rule); no `setState` directly in effects (`react-hooks/set-state-in-effect`);
all dates in `da-DK`, `Europe/Copenhagen`; no `dangerouslySetInnerHTML`; only design tokens from
`globals.css`.

**Scale/Scope**: One page, ~10 small components, ~6 pure modules, at least 15 mock tickets.

All items are resolved; no NEEDS CLARIFICATION remain (see [research.md](research.md)).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Pre-research | Post-design |
|-----------|-------|--------------|-------------|
| I. Design Fidelity | UI follows Figma node `323:1906`; uses existing classes; missing layout values (`769px`, `520px`, `17px`, `12px`) added as tokens from Figma ([R7](research.md#r7-layout-values-missing-from-globalscss)); icons downloaded from Figma ([R6](research.md#r6-icons-and-assets-from-figma)) | ✅ | ✅ (one justified deviation: focus outline, see Complexity Tracking) |
| II. Single Source of Data Types | All types in `apps/admin/lib/types.ts`, shaped like a Convex `feedback` document (`_id`, `_creationTime`) ([data-model.md](data-model.md)) | ✅ | ✅ |
| III. Untrusted Feedback Content | User strings rendered only as React text; `pageUrl` linked only after `isSafeHttpUrl`; tests with markup and `javascript:` in mock data | ✅ | ✅ |
| IV. Simplicity | No runtime dependencies; native controls instead of a UI library; `Intl` instead of a date library; dev dependencies justified below | ✅ | ✅ |
| V. Small, Prop-Driven Components | Only the page imports mock data; one stateful container; all other components take props ([contracts](contracts/components.md)) | ✅ | ✅ |
| VI. Tested Logic and Components | Vitest tests for every `lib/inbox` module and for the components, including literal-markup and keyboard tests ([quickstart](quickstart.md#1-automated-checks-constitution-quality-gate)) | ✅ | ✅ |
| Tech constraints | TypeScript strict, npm, Danish UI text ([R8](research.md#r8-danish-interface-text)), Next.js docs consulted ([R1](research.md#r1-where-the-inbox-lives-and-how-the-page-is-split)–[R6](research.md#r6-icons-and-assets-from-figma)) | ✅ | ✅ |
| Quality gates | `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` | ✅ | ✅ |

**New dependencies** (all dev-only, Constitution IV):

| Package | Reason |
|---------|--------|
| `vitest`, `jsdom`, `@testing-library/react` | Sanctioned test stack (Constitution VI). |
| `@testing-library/dom` | Required peer dependency of `@testing-library/react`. |
| `@vitejs/plugin-react` | JSX transform for Vitest; part of the official Next.js Vitest setup. |
| ~~`vite-tsconfig-paths`~~ | Dropped during implementation: Vite 8 resolves the `@/*` alias itself (`resolve.tsconfigPaths: true`). |
| `@testing-library/user-event` | Realistic Tab/Enter/Space keyboard tests for FR-024; `fireEvent` cannot move focus. |

## Project Structure

### Documentation (this feature)

```text
specs/001-feedback-inbox/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── components.md    # Phase 1: component props and pure-function signatures
├── checklists/
│   └── requirements.md
├── design/
│   └── inbox.png
└── tasks.md             # Phase 2 (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
apps/admin/
├── app/
│   ├── page.tsx                      # REPLACED: Server Component, passes mock data to Inbox
│   └── globals.css                   # + inbox layout tokens, :focus-visible rule
├── components/
│   ├── Icons/                        # shared icons any component can import
│   │   ├── Icon.tsx                  # renders a Figma SVG from public/icons/ at its native size
│   │   └── CategoryIcon.tsx (+ test)
│   └── inbox/                        # main component at the root, one folder per sub-component
│       ├── Inbox.tsx                 # "use client" container: useReducer + useNow
│       ├── Inbox.test.tsx, Inbox.keyboard.test.tsx
│       ├── Toolbar/                  # All/Done switch, category <select>, sort toggle
│       ├── TicketList/               # scrollable list + empty state
│       ├── TicketRow/                # one row (<button>)
│       ├── TicketDetail/             # right panel + empty state
│       ├── AttachmentList/
│       ├── ContextTable/
│       ├── ReplySection/             # reply field or sent reply + pinned actions/confirmation
│       └── StatusBadge/
│                                     # each folder: <Name>.tsx + <Name>.test.tsx
├── lib/
│   ├── types.ts                      # the single source of shared types (Constitution II)
│   ├── mock-feedback.ts              # ≥ 15 tickets (data-model.md, "Mock data")
│   └── inbox/
│       ├── state.ts  (+ state.test.ts)
│       ├── select.ts (+ select.test.ts)
│       ├── format.ts (+ format.test.ts)
│       ├── safe-url.ts (+ safe-url.test.ts)
│       └── use-now.ts
├── public/
│   └── icons/                        # SVGs downloaded from Figma (research R6)
├── vitest.config.mts                 # NEW
├── vitest.setup.ts                   # NEW: cleanup after each test
└── package.json                      # + "test" script, dev dependencies
```

**Structure Decision**: Everything for this feature lives in `apps/admin`. `components/` holds
UI, `lib/` holds types, mock data and pure logic, matching the `@/*` alias already in
`tsconfig.json`. `apps/demo-site`, `packages/widget` and `convex` are not touched. The starter
content of `app/page.tsx` and the now-unused starter SVGs in `public/` (`file.svg`, `globe.svg`,
`next.svg`, `vercel.svg`, `window.svg`) are removed.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Focus outline style (`2px` outline, `2px` offset, in `--brand`) is not in Figma (Constitution I) | FR-024 requires a visible focus outline; the design shows no focus state | Browser default outlines differ between browsers and clash with the design; the rule reuses the existing `--brand` token and is defined once in `globals.css` |
