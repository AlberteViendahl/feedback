---

description: "Task list for the Feedback Inbox feature"
---

# Tasks: Feedback Inbox

**Input**: Design documents from `/specs/001-feedback-inbox/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: Included. Constitution VI requires Vitest tests for all new logic and components in
the same change. Within each task, write the test file first, see it fail, then implement.

**Organization**: Phase 2 builds and tests all shared pure logic. Each user-story phase then adds
the UI slice for that story, so every story can be demonstrated and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1–US4 from spec.md)

## Conventions for every task

- All paths are relative to the repository root; all commands run from `apps/admin`.
- Before writing Next.js code, read the relevant guide in
  `apps/admin/node_modules/next/dist/docs/` (`apps/admin/AGENTS.md`).
- Types come only from `apps/admin/lib/types.ts`; import with the `@/` alias.
- Style only with classes and tokens from `apps/admin/app/globals.css`. If a needed value is
  missing, take it from Figma and add it there as a token first (Constitution I).
- Render user-supplied strings only as React text. Never use `dangerouslySetInnerHTML`.
- All visible text is Danish, using the copy table in [research.md R8](research.md#r8-danish-interface-text).
- Presentational components take only the props listed in
  [contracts/components.md](contracts/components.md) and never import mock data.
- Tests: `import { describe, expect, it } from "vitest"`, `render`/`screen` from
  `@testing-library/react`, `userEvent` from `@testing-library/user-event`. Put each test next to
  the file it tests.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test tooling and design assets

- [ ] T001 Install dev dependencies in `apps/admin` with `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event vite-tsconfig-paths` and add `"test": "vitest"` to the scripts in apps/admin/package.json
- [ ] T002 [P] Create apps/admin/vitest.config.mts as in the bundled guide `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`: `defineConfig({ plugins: [tsconfigPaths(), react()], test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] } })`
- [ ] T003 [P] Create apps/admin/vitest.setup.ts that imports `afterEach` from `vitest` and `cleanup` from `@testing-library/react` and calls `afterEach(() => cleanup())`
- [ ] T004 [P] Download the inbox icons into apps/admin/public/icons/: load the `figma:figma-design-to-code` skill, create a Figma session for file `Tw9qt246dOOdNdSOMXx65z`, call `get_design_context` on node `323:1675`, and `curl -L` these assets (matched by `data-name`) to these file names: Bug (31 px, list) → `category-bug.svg`, Lightbulb → `category-idea.svg`, Message → `category-general.svg`, Ikon – bug (chip, node `I323:1906;121:894`) → `bug.svg`, Ikon – clip → `paperclip.svg`, Ikon – image → `image.svg`, Status 40 px (node `I323:1906;121:922`) → `play-circle.svg`, Spill av → `play.svg`, Ikon – globe (node `I323:1906;121:932`) → `globe.svg`, Ikon – external → `external.svg`, Ikon – user → `user.svg`, Ikon – monitor → `monitor.svg`, Ikon – calendar → `calendar.svg`, Ikon – branch → `branch.svg`, Ikon – reply → `reply.svg`, Ikon – sort → `sort.svg`, Ikon – down → `chevron-down.svg`. Do not edit the SVGs; check each file is a non-empty SVG

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, tokens, mock data and all pure logic shared by the stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create apps/admin/lib/types.ts exporting exactly the types in [data-model.md](data-model.md): `FeedbackCategory`, `FeedbackStatus`, `Platform`, `Sender`, `FeedbackContext`, `Attachment` (discriminated union on `kind`: image has `sizeBytes`, video has `durationSeconds`), `Reply`, `Feedback` (with `_id`, `_creationTime`, `number`, `category`, `description`, `status`, `isRead`, `githubIssueCreated`, optional `reply`, `sender`, `context`, `attachments`). Add a top comment saying the module is replaced by Convex's `Doc<"feedback">` once `convex/schema.ts` exists
- [ ] T006 [P] In apps/admin/app/globals.css add to `:root`: `--inbox-height: 769px`, `--inbox-list-width: 520px`, `--inbox-gap: 17px` and `--inbox-toolbar-gap: 12px` (gap between toolbar controls and between toolbar and cards; Figma 11–13 px), plus a global rule `:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }` (justified in plan.md Complexity Tracking)
- [ ] T007 Create apps/admin/lib/mock-feedback.ts exporting `mockFeedback: Feedback[]` with at least 15 tickets and fixed `_creationTime` values covering every item in the "Mock data" section of [data-model.md](data-model.md). Reuse the content from [design/inbox.png](design/inbox.png) for the first 7 tickets (e.g. `#FB-1042` Anna Holm, anna@company.dk, Company ApS, Pro, `https://app.geotracking.dk/overview`, Chrome 130, macOS, 1440 × 900, image `screenshot-overview.png` 1.2 MB and video `screen-recording.mp4` 0:14). Include one description `<img src=x onerror=alert(1)>` and one `pageUrl` of `javascript:alert(1)`
- [ ] T008 [P] Write apps/admin/lib/inbox/format.test.ts, then implement apps/admin/lib/inbox/format.ts with `formatRelativeTime`, `formatShortDate`, `formatDateTime`, `formatTicketNumber`, `formatFileSize`, `formatDuration`, `getPagePath` (signatures in [contracts](contracts/components.md)) and the label maps `CATEGORY_LABELS` (Fejl, Forslag, Generel feedback), `PLATFORM_LABELS` (GEOtracking, SimpleSERP). Use `Intl.DateTimeFormat("da-DK", { timeZone: "Europe/Copenhagen", ... })`; relative labels follow the table in [research.md R3](research.md#r3-danish-date-and-time-formatting). Tests use fixed timestamps and cover every row of that table, `#FB-1042`, `1,2 MB`, `0:14`, `/overview`, and a non-URL `pageUrl` returned unchanged
- [ ] T009 [P] Write apps/admin/lib/inbox/safe-url.test.ts, then implement apps/admin/lib/inbox/safe-url.ts with `isSafeHttpUrl(value)`: parse with `new URL(value)` inside try/catch and return true only for protocol `http:` or `https:`. Test `https://…`, `http://…`, `javascript:alert(1)`, `data:text/html,…`, `/overview` and `not a url`
- [ ] T010 Write apps/admin/lib/inbox/state.test.ts, then implement apps/admin/lib/inbox/state.ts with `InboxState`, `InboxAction`, `STANDARD_REPLY` ("Din oplevelse er vigtig for os. Vi samler alle beskederne sammen, så vi kan gøre hjemmesiden endnu bedre."), `createInitialState(tickets)` and `inboxReducer(state, action)` exactly as in [data-model.md](data-model.md) (Inbox UI state, State transitions) and [contracts](contracts/components.md). Tests: initial values; `select` sets `selectedId`, sets `isRead = true`, resets `replyDraft` to `STANDARD_REPLY` and `notice` to null; filter/sort setters; `editReply`; `sendReply` sets `reply` and status `done` and notice `reply-sent`, and is a no-op for a blank draft or an existing reply; `createIssue` sets `githubIssueCreated`, sets `in_progress` unless `done`, sets notice `issue-created`, and is a no-op when already created. The reducer never mutates its input
- [ ] T011 Write apps/admin/lib/inbox/select.test.ts, then implement apps/admin/lib/inbox/select.ts with `getVisibleTickets(state)` (category filter, then status filter, then sort by `_creationTime` per `sortOrder`), `getCounts(tickets, category)` and `getSelectedTicket(state)` (returns the ticket only if it is in `getVisibleTickets(state)`). Tests cover every status × category × sort combination against a small fixture, counts per category, and a selected ticket hidden by a filter returning null (SC-003)
- [ ] T012 [P] Create apps/admin/lib/inbox/use-now.ts (`"use client"`) exporting `useNow(): number | null` built on `useSyncExternalStore`: `subscribe` starts a 60 000 ms `setInterval` that calls the callback and clears it on unsubscribe; `getSnapshot` returns `Math.floor(Date.now() / 60_000) * 60_000`; `getServerSnapshot` returns `null` ([research.md R2](research.md#r2-showing-relative-times-2-min-siden-with-cache-components-enabled))

**Checkpoint**: `npx vitest run` passes for all `lib/inbox` tests; `npx tsc --noEmit` is clean

---

## Phase 3: User Story 1 – Scan incoming feedback (Priority: P1) 🎯 MVP

**Goal**: The admin sees every ticket as a row with category icon, description preview, sender,
platform, page, attachment count, time and badge, in a fixed-height card whose list scrolls.

**Independent Test**: Load `/` with mock data; every ticket appears newest first with all row
fields and **Ny** on unread tickets; no "new feedback" banner; only the list scrolls.

- [ ] T013 [P] [US1] Write apps/admin/components/feedback-inbox/CategoryIcon.test.tsx, then create apps/admin/components/feedback-inbox/CategoryIcon.tsx: `next/image` of `/icons/category-{bug|idea|general}.svg` at 31 × 31 with `alt` from `CATEGORY_LABELS`. Test that each category renders its Danish alt text
- [ ] T014 [P] [US1] Write apps/admin/components/feedback-inbox/StatusBadge.test.tsx, then create apps/admin/components/feedback-inbox/StatusBadge.tsx applying the badge rule in [data-model.md](data-model.md) with `.badge` plus `.badge--new` (Ny), `.badge--progress` (I gang) or `.badge--done` (Færdig), rendering nothing otherwise. Test all four cases, including unread + done showing Ny
- [ ] T015 [US1] Write apps/admin/components/feedback-inbox/TicketRow.test.tsx, then create apps/admin/components/feedback-inbox/TicketRow.tsx: a `<button type="button">` with class `list-row` (plus `list-row--selected` and `aria-current="true"` when selected) calling `onSelect(ticket._id)`; inside, `CategoryIcon`, a two-line grid with the description in `.text-title .truncate-line`, time in `.text-meta` (`formatRelativeTime(ticket._creationTime, now)` or `formatShortDate` when `now` is null), the meta line `{email} · {platform label} · {getPagePath(pageUrl)}` in `.text-meta .truncate-line`, the paperclip icon with the attachment count only when attachments exist, and `StatusBadge`. Match spacing to Figma node `I323:1906;121:814`. Tests: all fields present, no paperclip without attachments, the `<img src=x onerror=alert(1)>` description appears as literal text and creates no `img` element, `onSelect` called on click
- [ ] T016 [US1] Write apps/admin/components/feedback-inbox/TicketList.test.tsx, then create apps/admin/components/feedback-inbox/TicketList.tsx: a `<ul>` of `<li>` each holding a `TicketRow`, inside a container that fills the card and scrolls vertically (`overflow-y: auto`); when `tickets` is empty, show "Ingen feedback matcher filtrene." instead. Tests: one row per ticket in the given order; empty-state text
- [ ] T017 [US1] Create apps/admin/components/feedback-inbox/FeedbackInbox.tsx (`"use client"`): `useReducer(inboxReducer, initialTickets, createInitialState)`, `const now = useNow()`, `getVisibleTickets(state)`; layout is a column with an empty toolbar slot above a two-column grid (`gap: var(--inbox-gap)`): left `.card` of width `var(--inbox-list-width)` and height `var(--inbox-height)` containing `TicketList` (`onSelect` dispatches `select`); right `.card` of the same height showing "Vælg en feedback i listen for at se detaljerne." Do not render the "new feedback just arrived" banner (FR-007)
- [ ] T018 [US1] Replace apps/admin/app/page.tsx with a Server Component that renders `<FeedbackInbox initialTickets={mockFeedback} />` inside a `<main>` padded with `var(--page-padding)`; in apps/admin/app/layout.tsx set `lang="da"` and metadata title "Feedback · Admin"; delete the unused starter files apps/admin/public/file.svg, globe.svg, next.svg, vercel.svg and window.svg (first confirm with `grep -r` that nothing references them)
- [ ] T019 [US1] Write apps/admin/components/feedback-inbox/FeedbackInbox.test.tsx: render `<FeedbackInbox initialTickets={fixture} />` with `vi.setSystemTime` fixed; assert every ticket is listed newest first, unread tickets show "Ny", the text "new feedback" / "ny feedback" is absent, and the right panel shows the select prompt

**Checkpoint**: `npm run dev` shows the scannable inbox; US1 tests pass

---

## Phase 4: User Story 2 – Read a ticket in full (Priority: P1)

**Goal**: Clicking (or Enter/Space on) a row opens the ticket in the right panel with header,
sender, full description, attachments and context; the row's **Ny** badge disappears for good.

**Independent Test**: Click any ticket; the panel shows all details, the row is highlighted, and
**Ny** is gone and stays gone after opening another ticket.

- [ ] T020 [P] [US2] Write apps/admin/components/feedback-inbox/AttachmentList.test.tsx, then create apps/admin/components/feedback-inbox/AttachmentList.tsx: renders nothing for an empty array; otherwise heading "Vedhæftede filer ({n})" in `.text-section-label` and one `.attachment` card per file with a `.attachment__preview` area (image: `image.svg`; video: `play-circle.svg` with `play.svg` on top), then file name (`.truncate-line`) and `· {formatFileSize}` or `· {formatDuration}` in `.text-caption`. Match Figma node `I323:1906;121:913`. Tests: hidden when empty, count heading, size vs duration, play icon only for video
- [ ] T021 [P] [US2] Write apps/admin/components/feedback-inbox/ContextTable.test.tsx, then create apps/admin/components/feedback-inbox/ContextTable.tsx: heading "Kontekst (sendt automatisk)" and a `.table-box` 2 × 3 grid with dividers: Platform (globe icon + label), Side (external icon + `getPagePath`; an `<a href target="_blank" rel="noopener noreferrer">` only when `isSafeHttpUrl(pageUrl)`, otherwise plain text), Bruger (user icon + `{email} · ID {userId}`), Browser og OS (monitor icon + `{browser} · {os}`), Skærmstørrelse (monitor icon + `{w} × {h}`), Tidspunkt (calendar icon + `formatDateTime(sentAt)`). Labels in `.text-caption`, values in `.text-body`-sized text. Match Figma node `I323:1906;121:927`. Tests: all six cells, link for https URL, no link for `javascript:` URL
- [ ] T022 [US2] Write apps/admin/components/feedback-inbox/TicketDetail.test.tsx, then create apps/admin/components/feedback-inbox/TicketDetail.tsx with prop `ticket: Feedback | null` (reply props are added in US4): null → the prompt "Vælg en feedback i listen for at se detaljerne."; otherwise a header row with `.chip` (bug.svg for Fejl, category label) and `formatTicketNumber` in `.text-meta`, a `.divider`, the sender block (`.avatar` with the first letter of name or email, name in semibold or the email when name is missing, `· {email}`, then `{company} · {plan} · Sendt {formatDateTime}` in `.text-meta`), the description in `.text-body` with `white-space: pre-line`, then `AttachmentList` and `ContextTable`. The panel scrolls inside its card if content is taller. Match Figma node `I323:1906;121:891`. Tests: all fields, name fallback to email, line breaks kept, markup literal
- [ ] T023 [US2] In apps/admin/components/feedback-inbox/FeedbackInbox.tsx render `<TicketDetail ticket={getSelectedTicket(state)} />` in the right card; extend apps/admin/components/feedback-inbox/FeedbackInbox.test.tsx: clicking a row opens it and highlights it, its "Ny" badge disappears and stays gone after selecting another ticket, and focusing a row and pressing Enter or Space opens it (`userEvent.keyboard`)

**Checkpoint**: US1 + US2 together form the minimum useful inbox (spec); all tests pass

---

## Phase 5: User Story 3 – Narrow down and order the list (Priority: P2)

**Goal**: The admin filters by All/Done and category and toggles newest/oldest; counts follow
the category; a hidden open ticket empties the panel.

**Independent Test**: Apply each filter and sort option; the list contains exactly the expected
tickets in the expected order and the counts match.

- [ ] T024 [US3] Write apps/admin/components/feedback-inbox/InboxToolbar.test.tsx, then create apps/admin/components/feedback-inbox/InboxToolbar.tsx with the props in [contracts](contracts/components.md), laid out in a row with `gap: var(--inbox-toolbar-gap)`: a `.segmented` group of two `<button type="button">` `.segmented__item`s "Alle {all}" and "Færdig {done}" with `aria-pressed` and `.segmented__item--active` on the current one; a `<label className="pill-button">` with text "Kategori:" wrapping a native `<select>` (options Alle, Fejl, Forslag, Generel feedback; no native arrow, `chevron-down.svg` after it); a `.pill-button` toggle with `sort.svg` reading "Nyeste først" or "Ældste først". Match Figma nodes `323:1908`, `323:1907` and `121:645`. Tests: counts shown, `aria-pressed` state, each control calls its callback with the right value
- [ ] T025 [US3] In apps/admin/components/feedback-inbox/FeedbackInbox.tsx render `InboxToolbar` in the toolbar slot with `getCounts(state.tickets, state.categoryFilter)` and dispatches for the three setters; extend apps/admin/components/feedback-inbox/FeedbackInbox.test.tsx: "Færdig" lists only done tickets, choosing "Fejl" lists only Fejl tickets and updates both counts, the sort toggle reverses the order, and a filter that hides the open ticket shows the panel prompt again

**Checkpoint**: US1–US3 work; all tests pass

---

## Phase 6: User Story 4 – Reply to the user or escalate to GitHub (Priority: P2)

**Goal**: The admin edits the pre-filled reply and sends it once (ticket → Færdig, sent text shown
read-only), or creates one GitHub issue (ticket → I gang); both are simulated with confirmations.

**Independent Test**: Open a ticket, edit and send the reply, and on another ticket create an
issue; check confirmations, badges, counts and that each action becomes unavailable.

- [ ] T026 [US4] Write apps/admin/components/feedback-inbox/ReplySection.test.tsx, then create apps/admin/components/feedback-inbox/ReplySection.tsx with the props in [contracts](contracts/components.md): when `reply` is undefined, a `<label>` "Svar kunden – du kan ændre i det automatiske svar" (`.text-section-label`) for a `<textarea className="textarea">` bound to `replyDraft`; when `reply` is set, a read-only block "Sendt svar · {formatDateTime(reply.sentAt)}" with the text (pre-line). Below a `.divider`, right-aligned `.button`s: "Opret GitHub-issue" (branch.svg; not rendered when `githubIssueCreated`) and "Færdig/send" (reply.svg; not rendered when `reply` is set; `disabled` when `replyDraft.trim()` is empty). A `role="status"` element shows "Svaret er sendt." or "GitHub-issue er oprettet." for the `notice`. Match Figma nodes `I323:1906;121:950`–`121:960`. Tests: form vs sent reply, disabled send for blank text, issue button hidden after creation, notice text, callbacks fire
- [ ] T027 [US4] Extend apps/admin/components/feedback-inbox/TicketDetail.tsx to the full `TicketDetailProps` in [contracts](contracts/components.md) and render `ReplySection` (pinned to the bottom of the panel, as in the design) with the ticket's `reply` and `githubIssueCreated`; update apps/admin/components/feedback-inbox/TicketDetail.test.tsx for the new props
- [ ] T028 [US4] In apps/admin/components/feedback-inbox/FeedbackInbox.tsx pass `replyDraft`, `notice` and callbacks to `TicketDetail`: `editReply`, `sendReply` with `now: Date.now()` read inside the click handler (never during render), and `createIssue`; extend apps/admin/components/feedback-inbox/FeedbackInbox.test.tsx: sending shows the confirmation, the sent text and time, badge "Færdig" and the Færdig count +1; creating an issue shows the confirmation, badge "I gang" and removes the button; a done ticket stays "Færdig" after creating an issue

**Checkpoint**: All four user stories work; all tests pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, safety, visual fidelity and the quality gate

- [ ] T029 [P] Write apps/admin/components/feedback-inbox/FeedbackInbox.keyboard.test.tsx: using only `userEvent.tab()`, Enter and Space, reach and operate the All/Done buttons, the category select, the sort toggle, a ticket row, the reply textarea, "Færdig/send" and "Opret GitHub-issue"; assert focus lands on each in order and every action works (FR-024, SC-008)
- [ ] T030 [P] Audit apps/admin (excluding node_modules and .next) with `grep -rn "dangerouslySetInnerHTML\|innerHTML\|insertAdjacentHTML"` (expect no matches) and `grep -rn "mock-feedback"` (expect only apps/admin/app/page.tsx), fixing anything found (Constitution III and V)
- [ ] T031 Compare the running app (`npm run dev`, http://localhost:3000) side by side with specs/001-feedback-inbox/design/inbox.png and a fresh Figma `get_screenshot` of node `323:1906`; fix any difference in color, spacing, type or layout in the components, adding missing values as tokens in apps/admin/app/globals.css (SC-002). Allowed differences: Danish wording and the missing banner
- [ ] T032 Run the quality gate from `apps/admin`: `npm run lint`, `npx tsc --noEmit`, `npx vitest run` and `npm run build`; all must pass, and the build must show no `blocking-prerender` errors
- [ ] T033 Walk through every section of specs/001-feedback-inbox/quickstart.md, including the keyboard-only pass, and fix any failure

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T002–T004 can start once T001 has installed packages
  (T004 does not need T001 at all).
- **Foundational (Phase 2)**: depends on T001–T003 for running tests. Blocks all user stories.
- **US1 (Phase 3)**: depends on Phase 2 and T004 (icons).
- **US2 (Phase 4)**: depends on US1 (it renders inside `FeedbackInbox` and opens rows from the
  list).
- **US3 (Phase 5)**: depends on US1 only; can run before or after US2.
- **US4 (Phase 6)**: depends on US2 (the reply section lives in the details panel).
- **Polish (Phase 7)**: depends on all stories.

### Within Phase 2

- T005 first (types). T006, T008, T009 and T012 can run in parallel with each other.
- T007 needs T005. T010 needs T005. T011 needs T010 (`InboxState`).

### Within Each User Story

- Small leaf components marked [P] first, then the components that use them, then wiring into
  `FeedbackInbox.tsx`, then the `FeedbackInbox.test.tsx` extension.
- Tasks that touch `FeedbackInbox.tsx` or `FeedbackInbox.test.tsx` (T017, T019, T023, T025, T028)
  are never parallel with each other.

### Parallel Opportunities

- Phase 1: T002, T003, T004
- Phase 2: T006, T008, T009, T012 (after T005)
- US1: T013 and T014
- US2: T020 and T021
- After US1: US3 (T024–T025) can proceed alongside US2 (T020–T023) if two people work on it,
  coordinating only on `FeedbackInbox.tsx`
- Polish: T029 and T030

---

## Parallel Example: User Story 2

```bash
# The two leaf components of the panel have no shared files:
Task: "AttachmentList.tsx + AttachmentList.test.tsx in apps/admin/components/feedback-inbox/"
Task: "ContextTable.tsx + ContextTable.test.tsx in apps/admin/components/feedback-inbox/"
# Then, in order:
Task: "TicketDetail.tsx + test (uses both)"
Task: "Wire TicketDetail into FeedbackInbox.tsx + extend FeedbackInbox.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

The spec calls US1 and US2 together "the minimum useful inbox".

1. Phase 1: Setup
2. Phase 2: Foundational (all pure logic tested)
3. Phase 3: US1 → **validate**: the list is scannable
4. Phase 4: US2 → **validate**: tickets can be read in full → demo-able MVP

### Incremental Delivery

1. Setup + Foundational → logic ready and tested
2. + US1 → scannable list
3. + US2 → readable tickets (MVP)
4. + US3 → filtering and sorting
5. + US4 → reply and escalate
6. Polish → keyboard, safety audit, visual check, quality gate

Each step keeps all earlier tests green; commit after each task or checkpoint.

---

## Notes

- [P] tasks = different files, no dependencies on unfinished tasks
- Write each test first and see it fail before implementing
- Figma asset URLs expire after 7 days; T004 must download them, never reference them in code
- Stop at any checkpoint to validate a story on its own
