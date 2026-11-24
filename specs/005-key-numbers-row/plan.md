# Implementation Plan: Key Numbers Row

**Branch**: `priorities` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-key-numbers-row/spec.md`

## Summary

Show four non-interactive key-number cards above the inbox filters: new, in progress, done in the
last 30 days, and bugs this week with the change against last week.

Technical approach:

- **Counting**: a pure `getKeyNumbers(tickets, now)` in `lib/tickets/key-numbers.ts`, called by
  `Inbox`, which already has the tickets and the clock ([R1](research.md#r1-where-the-numbers-are-counted)).
  Time-based cards show "–" until the browser knows the time ([R2](research.md#r2-the-clock-before-hydration)).
- **Completion time**: `Feedback` gains `completedAt`, set by `sendReply` and added to the done
  mock tickets ([R3](research.md#r3-recording-when-a-ticket-is-completed-fr-013)).
- **Week and 30 days**: Monday 00:00 local time via `Date` methods; 30 × 24 h window
  ([R4](research.md#r4-last-30-days), [R5](research.md#r5-this-week-and-the-change-against-last-week)).
- **UI**: a presentational `KeyNumbers` list reusing the existing `.stat-card`, `.icon-frame` and
  `.text-stat` classes, plus a `.key-numbers` row that scrolls sideways below `xl`
  ([R7](research.md#r7-layout-and-styling), [R8](research.md#r8-not-interactive-but-readable-fr-009-fr-010)).
- **Icons**: `BugIcon` switches to `currentColor`; three new icons (inbox, progress, check) come
  from Figma ([R6](research.md#r6-icons-and-colours)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents`), Tailwind CSS 4.3.3,
Zustand 5.1.0. No new dependencies.

**Storage**: None. Tickets live in the Zustand store, seeded from mock data.

**Testing**: Vitest, Testing Library, user-event, jsdom (existing).

**Target Platform**: Same browsers and widths as specs 001–003 (desktop and tablet).

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: Counting is one pass over the tickets per render (tens of tickets today);
no measurable cost.

**Constraints**:

- No clock reads during render (Cache Components); time comes from `useNow()`.
- Search and filters must not feed into the numbers (FR-007).
- Colours, sizes and icons from Figma via `globals.css` tokens (Constitution I).

**Scale/Scope**: One new component, one new pure module, one new type field, three new icons, one
CSS row class.

**Inputs from Figma**: SVG exports of the inbox, progress and check icons in
`~/Documents/feedback-icons` (`inbox.svg`, `progress.svg`, `done.svg`); card width on tablet and
smaller: 264px, with the row scrolling sideways.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
| --------- | ----- | ------ |
| I. Design Fidelity | Design screenshots referenced in the spec; existing stat tokens and classes reused; missing values (tablet card width, icon frame fill) and the three icons taken from Figma and added as tokens/components; Danish labels. | Pass |
| II. Single Source of Data Types | `completedAt` added to `Feedback` in `lib/types.ts` only; `KeyNumbers` is a derived return type, not an entity. | Pass |
| III. Untrusted Feedback Content | The row shows only counts and fixed Danish labels; no user content. | Pass |
| IV. Simplicity | No new dependencies; plain `Date` methods for weeks; one pure function, one component. | Pass |
| V. Small, Prop-Driven Components | `KeyNumbers` receives `numbers` via props; `Inbox` (the container) reads store and clock. | Pass |
| VI. Tested Logic and Components | Tests for `getKeyNumbers`, `sendReply`'s `completedAt`, `KeyNumbers`, and the `Inbox` integration (quickstart). | Pass |

**Post-design re-check**: Pass. The design adds no dependency, no new type module and no
interactive elements; the only change to existing behaviour is `BugIcon`'s colour, which returns
the bug glyph to the Figma colour (R6).

## Project Structure

### Documentation (this feature)

```text
specs/005-key-numbers-row/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/key-numbers.md
├── design/              # desktop.png, tablet.png, key-numbers.png
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/admin/
├── app/globals.css                         # .key-numbers row; tokens measured in Figma;
│                                           # .category-badge--bug colour
├── components/
│   ├── Icons/
│   │   ├── BugIcon.tsx                     # fill → currentColor
│   │   ├── InboxIcon.tsx                   # new, from Figma
│   │   ├── ProgressIcon.tsx                # new, from Figma
│   │   └── CheckIcon.tsx                   # new, from Figma
│   └── inbox/
│       ├── Inbox.tsx                       # renders KeyNumbers above Toolbar
│       ├── Inbox.test.tsx                  # numbers follow open / Done-send
│       └── KeyNumbers/
│           ├── KeyNumbers.tsx              # new
│           └── KeyNumbers.test.tsx         # new
├── lib/
│   ├── types.ts                            # Feedback.completedAt
│   ├── mock-feedback.ts                    # completedAt on done tickets
│   ├── inbox/test-fixtures.ts              # completedAt on done fixtures
│   └── tickets/
│       ├── key-numbers.ts                  # new: getKeyNumbers
│       ├── key-numbers.test.ts             # new
│       ├── state.ts                        # sendReply sets completedAt
│       └── state.test.ts
└── docs/architecture.md                    # sections 2 and 3, all four levels
```

**Structure Decision**: Everything stays in `apps/admin`, following the existing split: pure logic
in `lib/tickets/`, presentational components in `components/inbox/`, icons in
`components/Icons/`. `docs/architecture.md` is updated in the same change, as `apps/admin/CLAUDE.md`
requires.

## Complexity Tracking

No violations.
