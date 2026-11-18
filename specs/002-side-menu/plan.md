# Implementation Plan: Side Menu

**Branch**: `side-menu` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-side-menu/spec.md`

## Summary

Add a full-height side menu to every admin page: product name, the "Organic Growth" workspace and
its platforms (GEOtracking, SimpleSERP) with live counts of unopened feedback, "Indstillinger",
and the logged-in user with a log-out link. Add empty platform and settings pages, a "page not
found" page and a "Du er logget ud" page. All data is mock data.

Technical approach: a route group `app/(admin)/` whose layout wraps the pages in a
`TicketsProvider` and a sticky app shell with the menu. The ticket data moves from the inbox into
that provider so the menu and inbox share it and it survives navigation, while the inbox keeps
only its view state locally so that resets ([research R1](research.md#r1-sharing-ticket-state-between-the-menu-and-the-inbox)).
Platform pages use `generateStaticParams` + `notFound()`, and the menu's active-item logic sits
in a `<Suspense>` boundary, as Cache Components requires
([R4](research.md#r4-platform-pages-with-cache-components), [R5](research.md#r5-highlighting-the-current-page-in-the-menu)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents`, `partialPrefetching`),
Tailwind CSS 4.3.3 + `apps/admin/app/globals.css`. No new dependencies (runtime or dev).

**Storage**: None. Mock data in `lib/mock-feedback.ts` (existing) and `lib/mock-workspace.ts`
(new); ticket changes live in a React context for the session.

**Testing**: Vitest + Testing Library + jsdom (existing setup); `next/navigation` mocked with
`vi.mock` where `usePathname` is used.

**Target Platform**: Desktop browsers; small screens out of scope.

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: Counts update in the same render as the inbox (SC-007, < 0.5 s).

**Constraints**: Cache Components: no `dynamicParams`, `usePathname` in a layout needs
`<Suspense>`, no clock reads during render. English URLs, Danish user-facing text. Only tokens and
classes from `globals.css`.

**Scale/Scope**: 5 routes, ~6 new components, 1 provider, ~5 pure modules; refactor of the inbox's
state into ticket data + view.

All items resolved; no NEEDS CLARIFICATION remain ([research.md](research.md)).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Pre-research | Post-design |
|-----------|-------|--------------|-------------|
| I. Design Fidelity | Menu follows Figma `323:2095` and the four screenshots; reuses `.sidebar`, `.brand-pill`, `.nav-item`, `.avatar`, `.divider`; missing spacing measured in Figma and added to `globals.css`; icons downloaded from Figma ([R9](research.md#r9-visual-design-and-assets)). Platform and settings pages are placeholders under the spec (FR-008, FR-009) and use existing classes only, as Principle I allows | ✅ | ✅ (one recorded deviation: not-found and logged-out pages without a design, see Complexity Tracking) |
| II. Single Source of Data Types | `Workspace`, `AdminUser` added to `lib/types.ts`; `Platform` stays there; platform labels moved to shared `lib/platforms.ts` ([data-model.md](data-model.md)) | ✅ | ✅ |
| III. Untrusted Feedback Content | The menu shows no feedback content; counts are numbers. Existing inbox rules unchanged | ✅ | ✅ |
| IV. Simplicity | No new dependencies; React context instead of a state library; links instead of router logic ([R1](research.md#r1-sharing-ticket-state-between-the-menu-and-the-inbox), [R6](research.md#r6-links-and-log-out)) | ✅ | ✅ |
| V. Small, Prop-Driven Components | Only `app/(admin)/layout.tsx` imports mock data; `SideMenuContainer` and `InboxContainer` are the only provider readers; `SideMenu`, `NavItem`, `UserBlock`, `Inbox` take props ([R2](research.md#r2-keeping-components-prop-driven-with-a-provider-constitution-v)) | ✅ | ✅ |
| VI. Tested Logic and Components | Tests for every new pure module and component, the provider + containers together, and keyboard use; existing inbox tests adapted ([quickstart](quickstart.md)) | ✅ | ✅ |
| Tech constraints | TypeScript strict, npm, Danish user-facing text ([R10](research.md#r10-danish-copy-and-page-titles)), English URLs and code, Next.js docs consulted (R3–R6) | ✅ | ✅ |
| Quality gates | `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` | ✅ | ✅ |

One recorded deviation from Principle I (not-found and logged-out pages without a Figma design);
see Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-side-menu/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── components.md    # Phase 1: routes, component props, pure functions, inbox changes
├── checklists/
│   └── requirements.md
├── design/              # side-menu.png + three page screenshots
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
apps/admin/
├── app/
│   ├── layout.tsx                    # CHANGED: title template
│   ├── globals.css                   # + app shell + side-menu classes/tokens
│   ├── not-found.tsx (+ test)        # NEW: Danish 404 for URLs outside the admin area
│   ├── page.tsx                      # MOVED → (admin)/page.tsx
│   ├── logged-out/
│   │   └── page.tsx (+ test)         # NEW: "Du er logget ud", no menu
│   └── (admin)/
│       ├── layout.tsx (+ test)       # NEW: TicketsProvider + app shell + menu (imports mock data)
│       ├── page.tsx                  # MOVED: `/` renders InboxContainer
│       ├── not-found.tsx (+ test)    # NEW: "Siden findes ikke" with the menu
│       ├── platforms/[platform]/
│       │   └── page.tsx (+ test)     # NEW: generateStaticParams + notFound()
│       └── settings/
│           └── page.tsx (+ test)     # NEW: empty settings page
├── components/
│   ├── Icons/Icon.tsx                # + side-menu icons
│   ├── TicketsProvider/
│   │   ├── TicketsProvider.tsx       # NEW: context + useTickets()
│   │   └── TicketsProvider.test.tsx
│   ├── side-menu/
│   │   ├── SideMenu.tsx (+ test)     # NEW: presentational menu
│   │   ├── SideMenu.keyboard.test.tsx     # Tab order through the menu
│   │   ├── SideMenuContainer.tsx (+ test) # NEW: reads useTickets() + usePathname()
│   │   ├── SideMenu.integration.test.tsx  # menu + inbox inside the provider
│   │   ├── NavItem/NavItem.tsx (+ test)
│   │   └── UserBlock/UserBlock.tsx (+ test)
│   └── inbox/
│       ├── InboxContainer.tsx        # NEW: reads useTickets(), renders Inbox
│       └── Inbox.tsx (+ tests)       # CHANGED: tickets + ticket callbacks as props, view state inside
├── lib/
│   ├── types.ts                      # + Workspace, AdminUser
│   ├── platforms.ts (+ test)         # NEW: PLATFORMS, PLATFORM_LABELS (moved), isPlatform
│   ├── mock-workspace.ts             # NEW
│   ├── tickets/
│   │   ├── state.ts (+ test)         # NEW: ticketsReducer (moved from lib/inbox/state.ts)
│   │   └── counts.ts (+ test)        # NEW: getNewCounts
│   ├── side-menu/
│   │   └── active-href.ts (+ test)   # NEW: getActiveHref
│   └── inbox/
│       ├── state.ts (+ test)         # CHANGED: view state only
│       ├── select.ts (+ test)        # CHANGED: (tickets, view) signatures
│       └── format.ts (+ test)        # CHANGED: PLATFORM_LABELS moved out
└── public/icons/                     # + side-menu SVGs from Figma
```

**Structure Decision**: All work stays in `apps/admin`, following the folder convention from spec
001 (main component at the feature folder root, one folder per sub-component, no `index.ts`).
The inbox's components below `Inbox` are untouched; only `Inbox`, its state module and its
selectors change, and spec 001's contract document is updated to match.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| The not-found and "Du er logget ud" pages have no Figma design (Principle I) | The spec asks for a log-out destination (FR-013) and pages for unknown addresses, and the spec does not mark them as placeholders | Waiting for designs would block log-out and leave unknown addresses without a Danish page. The pages use only existing classes (`.text-display`, `.text-subtitle`, `.card`, `.button`) and add no new values |
