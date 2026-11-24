---

description: "Task list for the key numbers row"
---

# Tasks: Key Numbers Row

**Input**: Design documents from `/specs/005-key-numbers-row/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/key-numbers.md

**Tests**: Included. Constitution VI requires tests for new logic and components in the same
change.

**Organization**: Tasks are grouped by user story so each story can be built and tested on its
own.

All paths are relative to `apps/admin/` unless they start with `specs/` or `~`. Run commands from
`apps/admin/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1–US4)

---

## Phase 1: Setup (icons and styles)

**Purpose**: The three new icons, the bug icon's colour, and the row's CSS.

- [X] T001 [P] Create `InboxIcon` in `components/Icons/InboxIcon.tsx` from `~/Documents/feedback-icons/inbox.svg`, built exactly like `components/Icons/ArrowLeftIcon.tsx`: copy the `viewBox` and path data unchanged, drop `width`/`height`, convert attributes to React names (`stroke-width` → `strokeWidth` etc.), replace `stroke="#4F46E5"` with `stroke="currentColor"`, and spread `svgIconAttributes(props)` from `./svgIcon` on the `<svg>`
- [X] T002 [P] Create `ProgressIcon` in `components/Icons/ProgressIcon.tsx` from `~/Documents/feedback-icons/progress.svg` the same way as T001, replacing `stroke="#A15C08"` with `stroke="currentColor"`
- [X] T003 [P] Create `CheckIcon` in `components/Icons/CheckIcon.tsx` from `~/Documents/feedback-icons/done.svg` the same way as T001, replacing `stroke="#13755B"` with `stroke="currentColor"`
- [X] T004 Add `InboxIcon`, `ProgressIcon` and `CheckIcon` to the `describe.each` list in `components/Icons/SvgIcons.test.tsx` (depends on T001–T003)
- [X] T005 [P] Change `BugIcon`'s `fill="#B80000"` to `fill="currentColor"` in `components/Icons/BugIcon.tsx`, and in `app/globals.css` add `color: var(--danger-fg);` to `.category-badge--bug` so the ticket list's bug stays red (research R6)
- [X] T006 [P] In `app/globals.css`: add the token `--stat-card-width: 264px; /* key number card on tablet and smaller (Figma) */` in the Layout group of `:root`; in `@layer components` next to `.stat-card` add `.key-numbers` (a `<ul>` reset: no list style, margin or padding) as `display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--inbox-gap);`, and inside `@media (width < theme(--breakpoint-xl))` make it `display: flex; overflow-x: auto;` with `.key-numbers > li { flex: 0 0 var(--stat-card-width); }`. Add `.stat-card .icon-frame { flex-shrink: 0; }` if needed. No hover styles or `cursor: pointer` (FR-009, FR-012, research R7)

**Checkpoint**: `npx vitest run components/Icons` passes.

---

## Phase 2: Foundational (completion time)

**Purpose**: Tickets record when they were completed (FR-013). US2 depends on it; US1 does not,
but the type change is shared, so it goes first.

- [X] T007 Add `completedAt?: number` to `Feedback` in `lib/types.ts`, with a comment: "Time the ticket was completed (status done), in milliseconds since epoch. Spec 005."
- [X] T008 In `lib/tickets/state.ts`, make `sendReply` also set `completedAt: action.now`; add a test in `lib/tickets/state.test.ts` that `sendReply` sets `completedAt` to `now` and that a refused second reply leaves it unchanged (depends on T007)
- [X] T009 [P] In `lib/mock-feedback.ts`, give every ticket with `status: "done"` a `completedAt` after its `_creationTime` (use the reply's `sentAt` where there is a reply; otherwise a plausible later time) (depends on T007)
- [X] T010 [P] In `lib/inbox/test-fixtures.ts`, give the done fixtures `t3` and `t5` a `completedAt` after their `_creationTime` (depends on T007)
- [X] T011 Add `completedAt` to the Feedback table in `specs/001-feedback-inbox/data-model.md`, noting it was added by spec 005, and add `completedAt = now` to the Done/send row of its state transitions

**Checkpoint**: `npx vitest run lib` passes; nothing visible has changed.

---

## Phase 3: User Story 1 – See how much work is waiting (Priority: P1) 🎯 MVP

**Goal**: The row shows four cards; "new" and "in progress" show their counts and update when a
ticket is opened or completed. "Done" and "bugs" show "–" until US2 and US3.

**Independent Test**: With the fixtures, the first card shows the number of unread tickets and
the second the number of read, not-done tickets; opening a new ticket moves one from the first to
the second.

### Tests for User Story 1

- [X] T012 [P] [US1] Create `lib/tickets/key-numbers.test.ts`: `newCount` counts `!isRead` and equals `getNewCounts(tickets).total`; `inProgressCount` counts `isRead && status !== "done"` (an opened `open` ticket counts; a done one does not); empty list gives 0s; search/filter state is not an input
- [X] T013 [P] [US1] Create `components/inbox/KeyNumbers/KeyNumbers.test.tsx`: renders a list named "Nøgletal" with four items in order with the labels "Nye · ikke åbnet endnu", "I gang", "Færdige · sidste 30 dage", "Fejl denne uge"; each item's text starts with its number; `null` numbers show "–"; 1234 shows "1.234" (da-DK); classes `stat-card--info|warning|success|danger` in that order

### Implementation for User Story 1

- [X] T014 [US1] Create `lib/tickets/key-numbers.ts` exporting `type KeyNumbers` and `getKeyNumbers(tickets: Feedback[], now: number | null): KeyNumbers` per `specs/005-key-numbers-row/contracts/key-numbers.md`; implement `newCount` and `inProgressCount`, and return `null` for `doneLast30Days`, `bugsThisWeek` and `bugsChange` for now (depends on T012)
- [X] T015 [US1] Create `components/inbox/KeyNumbers/KeyNumbers.tsx` (presentational, props `{ numbers: KeyNumbers }`): `<ul className="key-numbers" aria-label="Nøgletal">` with four `<li className="stat-card stat-card--…">`, each containing `<span className="icon-frame">` with the icon (`InboxIcon`, `ProgressIcon`, `CheckIcon`, `BugIcon`; decorative), then the number in `.text-stat` before the label in `.text-meta`-sized text; format numbers with `Intl.NumberFormat("da-DK")`, show "–" for `null` (depends on T001–T003, T005, T006, T013, T014)
- [X] T016 [US1] In `components/inbox/Inbox.tsx`, render `<KeyNumbers numbers={getKeyNumbers(tickets, now)} />` as the first child of `<section className="inbox">`, above `<Toolbar>` (depends on T015)
- [X] T017 [US1] In `components/inbox/Inbox.test.tsx`, add a `describe("Inbox – key numbers (spec 005)")` block: the first two cards match the fixtures; clicking an unread ticket lowers the first card by 1 and raises the second by 1; typing in search or changing the category filter leaves all numbers unchanged (depends on T016)

**Checkpoint**: The row is visible on `/` with new and in-progress counts; all tests pass. MVP.

---

## Phase 4: User Story 2 – See recent output (Priority: P2)

**Goal**: The third card counts tickets completed in the last 30 days.

**Independent Test**: With a fixed `now`, tickets completed 1, 10, 29 and 30 days ago count;
one completed 31 days ago does not; Done/send raises the card by 1.

### Tests for User Story 2

- [X] T018 [P] [US2] In `lib/tickets/key-numbers.test.ts`, add `doneLast30Days` cases: completed 29 days ago and exactly 30 days ago count, 30 days + 1 minute does not; a done ticket without `completedAt` does not count; a not-done ticket with `completedAt` does not count; `now === null` gives `null`

### Implementation for User Story 2

- [X] T019 [US2] In `lib/tickets/key-numbers.ts`, implement `doneLast30Days`: `status === "done" && completedAt !== undefined && now - completedAt <= 30 * 24 * 60 * 60 * 1000`; `null` when `now` is `null` (depends on T007, T018; research R4)
- [X] T020 [US2] In `components/inbox/Inbox.test.tsx`, add: opening an in-progress ticket, typing a reply and pressing Done/send lowers the second card by 1 and raises the third by 1 (the test already fakes the system clock) (depends on T016, T019)

**Checkpoint**: The third card shows a number after hydration; tests pass.

---

## Phase 5: User Story 3 – Spot a spike in bugs (Priority: P3)

**Goal**: The fourth card counts bugs sent this week (from Monday 00:00 local time) and shows the
change against last week.

**Independent Test**: With a fixed `now`, bugs sent this week and last week give the right count
and arrow.

### Tests for User Story 3

- [X] T021 [P] [US3] In `lib/tickets/key-numbers.test.ts`, add `bugsThisWeek`/`bugsChange` cases, building times as local dates with `new Date(y, m, d, h, min).getTime()`: a bug on Monday 00:00 counts, one on the previous Sunday 23:30 does not; ideas and general feedback are ignored; 7 this week vs 4 last week gives change 3; 2 vs 5 gives -3; equal gives 0; a week containing a daylight-saving change (e.g. `now` on 2026-10-28, local Monday 2026-10-26) still starts at Monday 00:00; `now === null` gives `null` for both
- [X] T022 [P] [US3] In `components/inbox/KeyNumbers/KeyNumbers.test.tsx`, add: `bugsChange` 3 shows "↑ 3" next to the label with the arrow `aria-hidden` and visually hidden text "3 flere end sidste uge"; -3 shows "↓ 3" and "3 færre end sidste uge"; 0 and `null` show no change

### Implementation for User Story 3

- [X] T023 [US3] In `lib/tickets/key-numbers.ts`, add a local `startOfWeek(now)` helper (local `Date`: `setHours(0, 0, 0, 0)`, then `setDate(date.getDate() - ((date.getDay() + 6) % 7))`), last week's start by copying this Monday and calling `setDate(copy.getDate() - 7)`; implement `bugsThisWeek` (bugs with `_creationTime` in `[thisMonday, now]`) and `bugsChange` (`bugsThisWeek` minus bugs in `[lastMonday, thisMonday)`) (depends on T021; research R5)
- [X] T024 [US3] In `components/inbox/KeyNumbers/KeyNumbers.tsx`, render the bug change after the label as " · " + `<span aria-hidden="true">↑ n</span>` / `↓ n` plus `<span className="sr-only">n flere|færre end sidste uge</span>`; nothing when `bugsChange` is `0` or `null` (depends on T022)

**Checkpoint**: All four cards show numbers; tests pass.

---

## Phase 6: User Story 4 – Numbers are information only (Priority: P3)

**Goal**: The cards cannot be clicked or focused, and read well with a screen reader.

**Independent Test**: Tabbing never lands on a card; clicking a card changes nothing.

### Tests for User Story 4

- [X] T025 [P] [US4] In `components/inbox/KeyNumbers/KeyNumbers.test.tsx`, add: the list contains no `button`, `a` or element with `tabindex`; each item's accessible text is "number label" (e.g. "12 Nye · ikke åbnet endnu"); icons are `aria-hidden`
- [X] T026 [US4] In `components/inbox/Inbox.test.tsx`, add: clicking each card leaves the list, filters and open ticket unchanged; tabbing from the search field skips the cards and reaches the first toolbar control (depends on T016)

**Checkpoint**: Accessibility tests pass; no interactive styles in `app/globals.css` for the row.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T027 Update `docs/architecture.md` at all four levels of section 2 (Component tree: `KeyNumbers` under `Inbox`; the icon note lists `InboxIcon`, `ProgressIcon`, `CheckIcon` and `BugIcon` in `KeyNumbers`) and section 3 (Data flow: `Inbox` passes `getKeyNumbers(tickets, now)` to `KeyNumbers` as props; tickets gain `completedAt` via `sendReply`), as required by `apps/admin/CLAUDE.md`
- [X] T028 Run `npm run lint`, `npx tsc --noEmit` and `npx vitest run` in `apps/admin`; fix any failures
- [ ] T029 Manual check per `specs/005-key-numbers-row/quickstart.md`: restart `npm run dev` first (a running server may keep serving old global CSS), then check the row against `specs/005-key-numbers-row/design/` at desktop width and below the `xl` breakpoint (264px cards, sideways scroll)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T004 waits for T001–T003.
- **Foundational (Phase 2)**: T007 first; T008–T010 after it. Independent of Phase 1.
- **US1 (Phase 3)**: Needs Phase 1 (icons, CSS) and T007 (type). MVP.
- **US2 (Phase 4)**: Needs US1's `getKeyNumbers`/`KeyNumbers` and Phase 2.
- **US3 (Phase 5)**: Needs US1. Independent of US2.
- **US4 (Phase 6)**: Needs US1. Independent of US2 and US3.
- **Polish (Phase 7)**: After all stories.

### Within Each User Story

- Tests first (they should fail), then `lib/tickets/key-numbers.ts`, then the component, then
  `Inbox` integration.
- US2, US3 and US4 all edit `lib/tickets/key-numbers.ts`, `KeyNumbers.tsx` or their tests, so run
  them one after another, not in parallel.

### Parallel Opportunities

- T001, T002, T003, T005, T006 (different files).
- T009, T010 after T007.
- T012 and T013 (different test files).
- T018 (US2) and T022 (US3) touch different files and may be written together.

---

## Parallel Example: User Story 1

```text
Task: "T012 [US1] key-numbers.test.ts – newCount and inProgressCount"
Task: "T013 [US1] KeyNumbers.test.tsx – four cards, labels, dash, da-DK format"
```

## Parallel Example: Setup

```text
Task: "T001 InboxIcon from inbox.svg"
Task: "T002 ProgressIcon from progress.svg"
Task: "T003 CheckIcon from done.svg"
Task: "T005 BugIcon → currentColor"
Task: "T006 .key-numbers and --stat-card-width in globals.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (icons, CSS) and T007.
2. Phase 3 (US1): the row with new and in-progress counts; the other two cards show "–".
3. Stop and check: the row is visible and updates when a ticket is opened.

### Incremental Delivery

1. Setup + Foundational → US1 (MVP).
2. US2 → the done card fills in.
3. US3 → the bug card and its arrow.
4. US4 → accessibility checks.
5. Polish → architecture doc, full checks, manual check.

---

## Notes

- Danish UI text, English code and comments (constitution).
- Do not hard-code colours or sizes in components; use the tokens and classes in
  `app/globals.css` (Constitution I).
- `getKeyNumbers` must not read the clock; `now` comes from `useNow()` in `Inbox`.
- Commit after each phase or logical group.
