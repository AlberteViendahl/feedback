# Implementation Plan: Shared Ticket Store

**Branch**: `zustand` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-zustand-ticket-store/spec.md`

## Summary

Move the session's ticket data from a React Context provider into a Zustand store. The inbox and
the side menu then read it without a wrapper, tests set their tickets in one line, and logging
out clears the changes. The admin sees no other difference.

Technical approach:

- **Dependency**: add `zustand` 5.1.0, justified under Constitution IV
  ([research R1](research.md#r1-adding-zustand-constitution-principle-iv)).
- **Store**: `lib/tickets/store.ts` holds `{ tickets }`, starting from the mock data. Its actions
  (`markRead`, `sendReply`, `createIssue`, `resetTickets`) are plain exported functions that run
  the existing `ticketsReducer` ([R3](research.md#r3-store-shape-and-actions),
  [R4](research.md#r4-where-the-mock-data-enters)).
- **One global store, not one per request**: the server only reads the initial mock data, and
  every write happens on the client. This deliberately departs from Zustand's Next.js guide,
  whose per-request store would need a provider again
  ([R2](research.md#r2-one-global-store-not-one-per-request)).
- **Containers**: `InboxContainer` and `SideMenuContainer` read the store and pass the actions
  as callbacks. Presentational components do not change.
- **Log-out**: a small `ResetTickets` component on `/logged-out` clears the store whenever the
  page is shown. Today the changes survive log-out, because Next.js only hides the admin pages
  ([R5](research.md#r5-clearing-ticket-changes-on-log-out-fr-008)).
- **Tests**: `vitest.setup.ts` resets the store after every test. The provider wrappers become
  one-line `setState` calls ([R6](research.md#r6-test-isolation-fr-010),
  [R7](research.md#r7-tests-that-change-or-go-away)).
- **Earlier specs**: short notes in specs 001 to 003 point to this spec. Their requirements do
  not change ([R8](research.md#r8-documents-from-earlier-specs)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents`, `partialPrefetching`),
Tailwind CSS 4.3.3. **New runtime dependency: `zustand` 5.1.0** (justified below).

**Storage**: None. The tickets live in memory in each browser tab and start from the mock data on
every page load.

**Testing**: Vitest, Testing Library, user-event and jsdom (existing). `vitest.setup.ts` gains a
store reset after each test.

**Target Platform**: The same browsers and widths as specs 002 and 003. Nothing visual changes.

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: No change. A disallowed action keeps the same array, and the
`state.tickets` selector then makes no component re-render.

**Constraints**:

- No visible change apart from log-out (FR-005).
- The store is client-only: never imported by Server Components, never written during render.
- It holds only data that is the same for every visitor ([R2](research.md#r2-one-global-store-not-one-per-request)).
- Presentational components do not change (FR-007).
- The Next.js docs were read (`preserving-ui-state.md`: Activity, effect cleanup, log-out flows),
  as `AGENTS.md` requires.

**Scale/Scope**:

- New: 1 store module, 1 component (`ResetTickets`), and their tests.
- Changed:
  - 2 containers
  - the admin layout and 2 pages (one only in a comment)
  - `vitest.setup.ts`
  - 5 test files, plus a comment in `Inbox.tsx`
- Removed: `components/TicketsProvider/` (2 files).
- Docs: notes in 8 files in specs 001 to 003.

All items are resolved. No NEEDS CLARIFICATION remain ([research.md](research.md)).

### New dependencies (Constitution IV)

| Package | Version | Why it is needed | Why existing tools are not enough |
|---------|---------|------------------|-----------------------------------|
| `zustand` | 5.1.0 (exact) | Ticket data without a wrapper in the app or tests (FR-006, FR-010, SC-004), and clearing it from the logged-out page, outside the admin layout (FR-008) | React Context needs a provider around every consumer and can only be reached inside it. A hand-written store on `useSyncExternalStore` would work, but means owning a small home-made state library. Zustand is that idea in a known, documented form, at 636 bytes gzipped with no runtime dependencies ([R1](research.md#r1-adding-zustand-constitution-principle-iv)) |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Pre-research | Post-design |
|-----------|-------|--------------|-------------|
| I. Design Fidelity | No UI, copy, token or class changes. The logged-out page keeps its markup. SC-005 compares screenshots before and after ([quickstart](quickstart.md)) | ✅ | ✅ |
| II. Single Source of Data Types | `Feedback`, `TicketAction` and `ticketsReducer` are unchanged. `TicketsState` is the store's own shape (`{ tickets: Feedback[] }`), not a second definition of an entity | ✅ | ✅ |
| III. Untrusted Feedback Content | Rendering does not change. No HTML, and no new places that show feedback | ✅ | ✅ |
| IV. Simplicity | One new runtime dependency, justified in the table above and in [R1](research.md#r1-adding-zustand-constitution-principle-iv). No middleware, no persistence, no `__mocks__` machinery, one store. This reverses spec 002 R1's rejection of Zustand; the reason is recorded there as a note ([R8](research.md#r8-documents-from-earlier-specs)) | ✅ (with justification) | ✅ |
| V. Small, Prop-Driven Components | Presentational components keep receiving data through props and are unchanged. The two containers read the store. The store imports the mock data, which the principle allows because the store is not a component ([R4](research.md#r4-where-the-mock-data-enters)). Swapping in Convex still changes only containers and data modules | ✅ | ✅ |
| VI. Tested Logic and Components | New tests for the store, `ResetTickets`, the logged-out page and log-out in the integration test. The existing tests keep their assertions, and the store is reset between tests ([contracts](contracts/components.md#test-setup-changed)) | ✅ | ✅ |
| Tech constraints | TypeScript strict, npm (`npm install --save-exact` updates `package-lock.json`), no new copy, Next.js docs consulted | ✅ | ✅ |
| Quality gates | `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` | ✅ | ✅ |

The constitution itself is not amended. Principle IV already allows a dependency that a plan
justifies.

## Project Structure

### Documentation (this feature)

```text
specs/004-zustand-ticket-store/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── components.md    # Phase 1: store API, containers, ResetTickets, pages, test setup
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
apps/admin/
├── package.json, package-lock.json        # + "zustand": "5.1.0"
├── vitest.setup.ts                        # CHANGED: resetTickets() after each test
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                     # CHANGED: no TicketsProvider, no mockFeedback import
│   │   └── page.tsx                       # comment only
│   └── logged-out/
│       ├── page.tsx                       # CHANGED: renders <ResetTickets />
│       └── page.test.tsx                  # + clears ticket changes
├── components/
│   ├── ResetTickets/
│   │   ├── ResetTickets.tsx               # NEW: resetTickets() whenever shown
│   │   └── ResetTickets.test.tsx          # NEW
│   ├── TicketsProvider/                   # REMOVED (component and test)
│   ├── inbox/
│   │   ├── InboxContainer.tsx             # CHANGED: reads the store, actions as callbacks
│   │   ├── Inbox.tsx                      # comment only
│   │   ├── Inbox.test.tsx                 # setup only
│   │   └── Inbox.keyboard.test.tsx        # setup only
│   └── side-menu/
│       ├── SideMenuContainer.tsx          # CHANGED: reads the store
│       ├── SideMenuContainer.test.tsx     # setup only
│       └── SideMenu.integration.test.tsx  # setup + log-out test
└── lib/tickets/
    ├── store.ts                           # NEW: useTicketsStore, markRead, sendReply,
    │                                      #   createIssue, resetTickets
    ├── store.test.ts                      # NEW
    └── state.ts (+ test)                  # unchanged: ticketsReducer

specs/001-feedback-inbox/{contracts/components.md, data-model.md}   # notes (R8)
specs/002-side-menu/{research.md, data-model.md, contracts/components.md, plan.md}  # notes
specs/003-search-top-bar/{research.md, data-model.md}               # notes
```

**Structure Decision**: All code stays in `apps/admin`.

- The store sits next to the ticket rules in `lib/tickets/`, because it is data, not UI.
- `ResetTickets` is a top-level component folder, like `TicketsProvider` was, because it is used
  by a page outside both the inbox and the side menu.
- The folder convention from spec 001 still applies.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. The new dependency is allowed by Principle IV with the justification above.
Departing from Zustand's own Next.js advice is not a constitution matter; it is recorded in
[research R2](research.md#r2-one-global-store-not-one-per-request).
