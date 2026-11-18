# Implementation Plan: Search Top Bar

**Branch**: `topbar` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-search-top-bar/spec.md`

## Summary

Add a search bar at the top of the inbox page. As the admin types, the ticket list narrows to the
tickets whose text, number, sender, platform or page contains every typed word. The search
combines with the existing category filter, All/Done filter and sort order. On wide windows the
bar spans the area right of the side menu, with a 420px field. Below 1024px the field fills the
width under the menu-button bar.

Technical approach:

- **State**: the search text becomes part of the inbox's view state (`InboxView.search`), so it
  resets with the filters when the inbox remounts
  ([research R1](research.md#r1-where-the-search-text-lives)).
- **Matching**: a new pure module, `lib/inbox/search.ts`, compares words with `includes` and
  never builds a pattern from the input ([R2](research.md#r2-how-tickets-are-matched)). The
  existing selectors apply it between the category filter and the All/Done filter, so the
  counts and the open-ticket rule follow automatically
  ([R3](research.md#r3-combining-the-search-with-filters-counts-and-the-open-ticket)).
- **Component**: a presentational `SearchBar` is rendered by `Inbox` above its toolbar. It runs
  across the content area by cancelling the page padding
  ([R6](research.md#r6-layout-a-full-width-bar-inside-the-padded-content-area)).
- **Navigation reset** (found during implementation): Next.js keeps the inbox page mounted but
  hidden after navigation, so `Inbox` resets its view in a `useLayoutEffect` cleanup
  ([R9](research.md#r9-nextjs-keeps-a-page-mounted-after-you-navigate-away-found-during-implementation)).
- **Styling**: it reuses the unused `.topbar` and `.search-input` classes from spec 001, with
  `.topbar` renamed `.search-bar`. The narrow-window values were measured from the tablet frame
  ([R7](research.md#r7-visual-values-and-the-search-icon)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents`, `partialPrefetching`),
Tailwind CSS 4.3.3 + `apps/admin/app/globals.css`. No new dependencies, runtime or dev.

**Storage**: None. The search text lives in the inbox's view state and is never saved or put in
the URL.

**Testing**: Vitest + Testing Library + user-event + jsdom (existing setup).

**Target Platform**: Desktop, tablet and phone browsers from 320px wide. The breakpoint is 1024px
(spec 002).

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: The list reflects each keystroke within 0.2 s for up to 1,000 tickets
(SC-003). Plain filtering during render is enough
([R4](research.md#r4-performance-sc-003)).

**Constraints**:

- The input is matched as plain text, never as a pattern or markup (FR-009, Principle III).
- Danish copy ([R8](research.md#r8-copy-danish)).
- Design values come from Figma and live in `globals.css`.
- The Figma MCP call limit was reached while planning. The narrow-window values were measured
  from the exported tablet frame, and the search icon still has to be downloaded from Figma
  ([R7](research.md#r7-visual-values-and-the-search-icon)).
- Cache Components is unaffected, because `Inbox` is already a client component and nothing
  reads the URL.

**Scale/Scope**:

- New: 1 component (`SearchBar`), 1 pure module (`search.ts`) and 1 icon.
- Changed: 2 inbox modules (`state.ts`, `select.ts`), 2 components (`Inbox`, `TicketList`),
  `Icon` and `globals.css`.

All items are resolved. No NEEDS CLARIFICATION remain ([research.md](research.md)).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Pre-research | Post-design |
|-----------|-------|--------------|-------------|
| I. Design Fidelity | Follows Figma `323:1707` and `323:1709` (desktop) and frame `356:435` (tablet). Reuses `.topbar` (renamed `.search-bar`), `.search-input`, `--surface`, `--surface-sunken`, `--border-color`, `--text-subtle` and `--radius-pill`, whose colours were confirmed against `design/top-bar.png`. Adds `--search-width: 420px` from Figma. Narrow-window values are measured from Figma's tablet export and kept in `globals.css`. The icon is downloaded from Figma `323:1710` rather than altered from `nav-search.svg` ([R7](research.md#r7-visual-values-and-the-search-icon)). The copy is Danish | ✅ | ✅ (re-check the narrow-window values in Figma when the MCP limit allows) |
| II. Single Source of Data Types | No shared type changes. Only the inbox's view state (`InboxView`) gains `search` ([data-model.md](data-model.md)) | ✅ | ✅ |
| III. Untrusted Feedback Content | Feedback is compared as strings only. No `RegExp` from input, no highlighting, no HTML. Rows keep their text-only rendering; a test searches for `<img` and checks the row stays text | ✅ | ✅ |
| IV. Simplicity | No new dependencies (no fuzzy-search library), no memoization or deferral, no URL state, no changes to `AppShell` ([R2](research.md#r2-how-tickets-are-matched), [R4](research.md#r4-performance-sc-003), [R6](research.md#r6-layout-a-full-width-bar-inside-the-padded-content-area)) | ✅ | ✅ |
| V. Small, Prop-Driven Components | `SearchBar` takes `value` and `onChange` only. `TicketList` gets an `isSearching` prop. `Inbox` keeps the view state, and no component imports mock data ([contracts](contracts/components.md)) | ✅ | ✅ |
| VI. Tested Logic and Components | Tests cover `search.ts`, the new state action, the changed selectors, `SearchBar`, the `TicketList` empty text, `Inbox` with the provider, and the updated keyboard order ([quickstart](quickstart.md)) | ✅ | ✅ |
| Tech constraints | TypeScript strict, npm, Danish user-facing text, English code. The Next.js docs were consulted (`<Form>`, [R1](research.md#r1-where-the-search-text-lives)) | ✅ | ✅ |
| Quality gates | `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` | ✅ | ✅ |

No deviations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-search-top-bar/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── components.md    # Phase 1: SearchBar, changed inbox props, pure functions, CSS
├── checklists/
│   └── requirements.md
├── design/
│   └── top-bar.png      # page and tablet references are in ../002-side-menu/design/
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
apps/admin/
├── app/
│   └── globals.css                    # CHANGED: .topbar → .search-bar, --topbar-height →
│                                      #   --search-bar-height, + --search-width, .search-field,
│                                      #   .search-input width/cancel button, narrow-window rules
├── components/
│   ├── Icons/Icon.tsx                 # + search
│   └── inbox/
│       ├── Inbox.tsx                  # CHANGED: renders SearchBar first; counts/isSearching;
│       │                              #   resets the view when hidden (R9)
│       ├── Inbox.test.tsx             # + search scenarios (US1)
│       ├── Inbox.keyboard.test.tsx    # CHANGED: Tab reaches the search field first
│       ├── SearchBar/
│       │   ├── SearchBar.tsx          # NEW: presentational search field
│       │   └── SearchBar.test.tsx     # NEW
│       └── TicketList/
│           ├── TicketList.tsx         # CHANGED: isSearching → empty-state text
│           └── TicketList.test.tsx    # + empty text while searching
├── lib/inbox/
│   ├── search.ts (+ test)             # NEW: getSearchWords, matchesSearch
│   ├── state.ts (+ test)              # CHANGED: InboxView.search, setSearch
│   └── select.ts (+ test)             # CHANGED: search in getVisibleTickets; getCounts(tickets, view)
└── public/icons/search.svg            # NEW: downloaded from Figma 323:1710

specs/001-feedback-inbox/contracts/components.md   # point getCounts/TicketList to spec 003
specs/002-side-menu/contracts/components.md        # same
```

**Structure Decision**: All code stays in `apps/admin`, inside the inbox feature folder, following
the folder convention from spec 001. The bar belongs to the inbox, because its text is inbox view
state and only the inbox page shows it (FR-005). It therefore lives in
`components/inbox/SearchBar/`, not in `components/app-shell/`. `AppShell`, the side menu and the
other pages are untouched.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations.
