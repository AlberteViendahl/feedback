---

description: "Task list for the Shared Ticket Store feature"
---

# Tasks: Shared Ticket Store

**Input**: Design documents from `/specs/004-zustand-ticket-store/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: Included. Constitution VI requires Vitest tests for new logic and components in the
same change, and the spec makes tests part of the requirements (FR-010, FR-011). Within each
task, write or update the test first, see it fail, then implement.

**Organization**:

- Phase 1 records the baseline screenshots and installs Zustand.
- Phase 2 builds the store and the reset between tests, which every story needs.
- User Story 1 moves the app onto the store with no visible change. This step also removes every
  provider wrapper, because the tests must stay green.
- User Story 2 proves the developer outcomes: test isolation and no wrappers left.
- User Story 3 makes log-out clear the ticket changes.
- Polish adds notes to earlier specs, compares screenshots and runs the quality gate.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1–US3 from spec.md)

## Conventions for every task

- **Paths and commands**: paths are relative to the repository root. Commands run from
  `apps/admin`, which has its own `package.json` and `package-lock.json`. There is no root
  workspace.
- **Next.js**: no Next.js API is added. The behaviour relied on is described in
  `apps/admin/node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`. Read it again
  before changing the logged-out page (`apps/admin/AGENTS.md`).
- **Folder convention** (spec 001): the main component sits at the root of its feature folder,
  each sub-component has its own folder named after it, and there are no `index.ts` files.
  Import by full path, e.g. `@/lib/tickets/store`.
- **Store rules** ([contracts](contracts/components.md#ticket-store-libticketsstorets-new)):
  - Only client components and tests import `lib/tickets/store.ts`.
  - Nothing writes to the store during render.
  - Selectors return `state.tickets` only, never a newly built object or array.
- **Unchanged**: `ticketsReducer` and `TicketAction` (`lib/tickets/state.ts`), `getNewCounts`,
  and every presentational component (`Inbox` apart from one comment, `SideMenu`, `UserBlock`,
  `AppShell`, `TicketList`, `TicketDetail` and the rest). Their props do not change (FR-007).
- **Tests**:
  - Import explicitly from `vitest`, `@testing-library/react` and `@testing-library/user-event`.
  - Use the fixtures in `apps/admin/lib/inbox/test-fixtures.ts`, adding tickets with
    `makeTicket` when needed.
  - Give a test its tickets with `useTicketsStore.setState({ tickets })` before `render`.
  - Keep every existing assertion about what the admin sees (FR-011, SC-001).
- **Baseline**: before this feature, `npx vitest run` gives 38 test files and 278 tests, all
  passing (2026-11-22).
- **Browser checks**:
  - Use the running dev server on <http://localhost:3000>, or start one with `npm run dev`.
  - Drive headless Firefox over WebDriver BiDi, as in spec 003, or check by hand.
  - Hidden admin pages stay in the DOM with `display: none`, so check visibility, not presence.
- **Commits**: none, unless the user asks.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline for the visual comparison, and the new dependency

- [X] T001 Take baseline screenshots of `/`, `/platforms/geotracking` and `/settings` at 1440px
  and 834px wide on the unchanged code (SC-005, quickstart §0).

  **Done by the user (2026-11-22)**: the screenshots are in
  `~/Documents/Projects/feedback-screenshots/004-zustand/before/{home-page-inbox,platforms,settings}/{1440px,834px}.png`.
  They are outside the repository, taken by hand at 2× pixel density.
- [X] T002 Install Zustand. In `apps/admin`, run `npm install zustand@5.1.0 --save-exact`.
  Check that:
  - `apps/admin/package.json` lists `"zustand": "5.1.0"` under `dependencies`
  - `apps/admin/package-lock.json` changed
  - `node_modules/zustand/package.json` reports version 5.1.0

  If the network sandbox blocks npm, retry with network access
  ([research R1](research.md#r1-adding-zustand-constitution-principle-iv)).

  **Result**: installed 5.1.0.
  - The lockfile adds only `node_modules/zustand` and the new dependency line.
  - npm also changed `"dev": true` to `"devOptional": true` on two type packages, because
    Zustand lists `@types/react` as an optional peer.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The store and the reset between tests. Every story reads or resets the store.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Write apps/admin/lib/tickets/store.test.ts first, then create
  apps/admin/lib/tickets/store.ts as in [contracts](contracts/components.md#ticket-store-libticketsstorets-new).

  The store:
  - `export const useTicketsStore = create<TicketsState>()(() => ({ tickets: mockFeedback }))`,
    with `type TicketsState = { tickets: Feedback[] }`.
  - A private `apply(action: TicketAction)` that calls
    `useTicketsStore.setState((state) => ({ tickets: ticketsReducer(state.tickets, action) }))`.
  - Exported `markRead(id)`, `sendReply(id, text, now)` and `createIssue(id)`, each calling
    `apply` with the matching action.
  - Exported `resetTickets()`, which calls
    `useTicketsStore.setState(useTicketsStore.getInitialState(), true)`.
  - No `"use client"` directive. Add a doc comment that says the store holds the session's tickets
    (spec 004), is client-only, is never written during render, and that only `state.tickets`
    should be selected.

  The tests, each setting `useTicketsStore.setState({ tickets: fixtureTickets })` first where it
  needs fixtures:
  - The initial tickets are `mockFeedback` (`toBe`).
  - `markRead` marks the ticket read.
  - `sendReply` stores the trimmed text and `sentAt`, and sets the status to `"done"`.
  - `createIssue` sets `githubIssueCreated`, and the status to `"in_progress"` unless done.
  - An unknown id, an empty reply, a second reply and a second issue each leave `tickets` as the
    same array (`toBe`).
  - `resetTickets()` after changes makes `getState().tickets` `toBe(mockFeedback)`.

  **Result**: the test failed first (no `./store` module), then all 6 tests passed.
- [X] T004 In apps/admin/vitest.setup.ts, import `resetTickets` from `@/lib/tickets/store` and
  call it in the existing `afterEach`, after `cleanup()`. Add the comment "The ticket store
  outlives a render: start every test from the mock data (spec 004, research R6)". Run
  `npx vitest run`: all 278 existing tests and the new store tests pass.

  **Result**: 39 files, 284 tests passed (278 + 6).

**Checkpoint**: the store exists and is tested. The app does not use it yet, so nothing visible
has changed.

---

## Phase 3: User Story 1 - Work with feedback exactly as before (Priority: P1) 🎯 MVP

**Goal**: The inbox and the side menu read and change tickets through the store, with no
provider. The admin sees no difference.

**Independent Test**:
- Every existing test passes with its assertions unchanged.
- In the browser, opening a ticket lowers the counts at once.
- Changes survive going to "Indstillinger" and back.
- A reload restores "4 nye".

- [X] T005 [US1] Switch the test setup from the provider to the store, before changing any
  component (TDD: these tests fail until T006). In each file below, remove the `TicketsProvider`
  import and wrappers, import `useTicketsStore` from `@/lib/tickets/store`, and keep every
  assertion:
  - apps/admin/components/inbox/Inbox.test.tsx:
    - `renderInbox(tickets = fixtureTickets)` calls `useTicketsStore.setState({ tickets })`,
      then `render(<InboxContainer />)`.
    - The FR-015 remount test sets the fixtures once, renders `<InboxContainer key="first" />`,
      then `rerender(<InboxContainer key="second" />)`.
    - The `<Activity>` test's `Page` renders `<Activity mode={mode}><InboxContainer /></Activity>`,
      with the fixtures set before the first render.
    - The comment "Ticket changes live in the provider and survive" becomes "Ticket changes live
      in the store and survive".
  - apps/admin/components/inbox/Inbox.keyboard.test.tsx: set the fixtures, then
    `render(<InboxContainer />)`, in both tests.
  - apps/admin/components/side-menu/SideMenuContainer.test.tsx: `renderAt` sets the fixtures,
    then renders `<SideMenuContainer … />` alone.
  - apps/admin/components/side-menu/SideMenu.integration.test.tsx:
    - Add `beforeEach(() => useTicketsStore.setState({ tickets }))`.
    - `app(inboxKey)` returns `<><SideMenuContainer … /><InboxContainer key={inboxKey} /></>`.
    - The comment "Same provider, new inbox" becomes "Same store, new inbox".

  Run `npx vitest run`. These four files fail with "useTickets must be used inside
  TicketsProvider". Everything else passes.

  **Result**: exactly these four files failed (45 tests: 33, 2, 6 and 4) with that error. The
  diff removes no `expect(` or `it(` line.
- [X] T006 [US1] Switch both containers to the store
  ([contracts](contracts/components.md#containers-changed)):
  - apps/admin/components/inbox/InboxContainer.tsx:
    - Read `const tickets = useTicketsStore((state) => state.tickets)`.
    - Pass `onOpenTicket={markRead}`, `onSendReply={sendReply}` and
      `onCreateIssue={createIssue}`.
    - The doc comment becomes "Connects the inbox to the shared ticket store. With Convex, swap
      the store for queries."
  - apps/admin/components/side-menu/SideMenuContainer.tsx: in `MenuWithCounts`, read
    `const tickets = useTicketsStore((state) => state.tickets)`. The rest stays.

  Run `npx vitest run`: everything passes, including the four files from T005 with their
  original assertions.

  **Result**: 39 files, 284 tests passed.
- [X] T007 [US1] Remove the provider:
  - apps/admin/app/(admin)/layout.tsx:
    - Remove the `<TicketsProvider>` wrapper and its import, and the `mockFeedback` import.
      `<AppShell>` becomes the root element.
    - Replace the two lines of the top comment with: "The one place that knows where the
      workspace and user come from. Today: mock data. Later: Convex. Ticket data lives in
      lib/tickets/store.ts (spec 004)."
  - apps/admin/app/(admin)/page.tsx: the comment becomes "The data comes from the ticket store
    (lib/tickets/store.ts)."
  - apps/admin/components/inbox/Inbox.tsx: in the comment above `useLayoutEffect`, "Ticket
    changes live in the provider." becomes "Ticket changes live in the ticket store."
  - Delete the folder apps/admin/components/TicketsProvider/ (`TicketsProvider.tsx` and
    `TicketsProvider.test.tsx`; [research R7](research.md#r7-tests-that-change-or-go-away)).

  Run `npx vitest run` and `npx tsc --noEmit`: all pass. `app/(admin)/layout.test.tsx` still
  finds "4 nye".

  **Result**: `tsc` is clean. 38 files, 281 tests passed: the 3 provider tests are gone, and
  the layout test still finds "4 nye".
- [X] T008 [US1] Check User Story 1 in the browser (quickstart §3, first three rows):
  1. Open an unread ticket: its "Ny" badge goes, and the GEOtracking or SimpleSERP count and the
     Organic Growth count drop by one.
  2. Send a reply. Create a GitHub issue on another ticket. Go to "Indstillinger" and back: both
     changes are kept, and the inbox view is at its defaults.
  3. Reload: "4 nye", "3 nye" and "1 ny" again.

  Record the results under this task.

  **Result (headless Firefox, 1440px, dev server)**:

  | Step | Counts (Organic Growth / GEOtracking / SimpleSERP) | Tickets |
  |------|----------------------------------------------------|---------|
  | First load | "4 nye" / "3 nye" / "1 ny" | 4 unread |
  | Opened #FB-1042 (GEOtracking) | "3 nye" / "2 nye" / "1 ny" | its "Ny" badge is gone |
  | Replied to it; opened #FB-1041 (SimpleSERP) and created an issue | "2 nye" / "2 nye" / none | "Færdig" and "I gang" |
  | Indstillinger, then back | unchanged | both kept; detail panel empty (view reset) |
  | Reload | "4 nye" / "3 nye" / "1 ny" | both "Ny" again |

  No error overlay appeared.

**Checkpoint**: The app runs on the store, the provider is gone, and the admin sees no
difference. This is the MVP.

---

## Phase 4: User Story 2 - Developers share ticket data without wrappers (Priority: P2)

**Goal**: Prove the developer outcomes: tests are isolated, no wrapper is left anywhere, and
presentational components are untouched.

**Independent Test**:
- The isolation tests pass.
- The audit greps in quickstart §2 give the expected results.
- `git status` shows only the planned files.

- [X] T009 [US2] In apps/admin/lib/tickets/store.test.ts, add a `describe("between tests (spec
  004 US2-3)")` block with two tests in this order:
  - The first calls `markRead` on the first unread ticket in `mockFeedback` and checks that it is
    read.
  - The second checks that `useTicketsStore.getState().tickets` is `toBe(mockFeedback)` and that
    the same ticket is unread.

  Add a comment that the pair relies on Vitest running a file's tests in order, and on the reset
  in `vitest.setup.ts` (T004). Check that the second test fails when the `resetTickets()` line
  in `vitest.setup.ts` is commented out, then restore it.

  **Result**: 8 store tests pass. With `resetTickets()` commented out in `vitest.setup.ts`, only
  "starts the next test from the mock data" failed. The line is restored.
- [X] T010 [US2] Audit (quickstart §2, SC-004, US2-4), from the repository root:
  - `grep -rnw "TicketsProvider\|useTickets\|createContext"` over apps/admin (`*.ts`, `*.tsx`,
    excluding `node_modules` and `.next`) finds nothing.
  - `grep -rn "mock-feedback"` finds only apps/admin/lib/tickets/store.ts.
  - `grep -rln "lib/tickets/store"` finds only:
    - the two containers
    - `vitest.setup.ts`
    - test files
    - and, after T012, `components/ResetTickets/ResetTickets.tsx`

    No `app/**/page.tsx` or `layout.tsx` imports it.
  - `git status --short` lists only the files in [plan.md](plan.md#source-code-repository-root).
  - `git diff` shows no change to `SideMenu.tsx`, `UserBlock.tsx`, `AppShell.tsx`,
    `TicketList.tsx` or `TicketDetail.tsx`, and only the comment line in `Inbox.tsx`.

  Record the results under this task.

  **Result (before US3)**:
  - **Provider grep**: one hit, the comment in `app/logged-out/page.tsx`, which T012 rewrites.
  - **`mock-feedback`**: imported by `lib/tickets/store.ts` and its test only.
  - **Store imports**: only the two containers, `vitest.setup.ts` and four test files.
    - The path grep also matched `app/(admin)/layout.tsx` and `page.tsx`, but only through their
      comments. The quickstart grep now matches `from "@/lib/tickets/store"` instead.
  - **`git status`**: only planned files.
  - **Presentational components**: unchanged, apart from the one comment line in `Inbox.tsx`.

  Re-run in T019 after US3.

**Checkpoint**: Ticket data has no wrapper in the app or the tests, every test starts from the
mock data, and presentational components are unchanged.

---

## Phase 5: User Story 3 - Logging out clears the session's ticket changes (Priority: P3)

**Goal**: Arriving at "Du er logget ud" clears every ticket change, so "Log ind igen", Back and
Forward all show the tickets as at first load.

**Independent Test**: Open a ticket, reply and create an issue, log out, then log back in: every
ticket and count is as at first load. The same holds after the browser's Back button.

- [X] T011 [P] [US3] Write apps/admin/components/ResetTickets/ResetTickets.test.tsx first, then
  create apps/admin/components/ResetTickets/ResetTickets.tsx
  ([contracts](contracts/components.md#reset-on-log-out-componentsresetticketsresetticketstsx-new),
  [research R5](research.md#r5-clearing-ticket-changes-on-log-out-fr-008)).

  The component:
  - starts with `"use client"`
  - `export function ResetTickets() { useEffect(() => resetTickets(), []); return null; }`
  - has a doc comment: "Clears the session's ticket changes whenever it is shown: on mount, and
    each time Next.js shows the page again after hiding it with Activity. Renders nothing."

  The tests:
  - Rendering it leaves the container empty.
  - After `markRead` on an unread mock ticket, rendering it makes `getState().tickets`
    `toBe(mockFeedback)`.
  - Render `<Activity mode="visible"><ResetTickets /></Activity>`, call `markRead`, rerender
    with `mode="hidden"` and check the change is still there (hiding does not clear). Rerender
    with `mode="visible"` and check the tickets are `toBe(mockFeedback)` again.

  **Result**: failed first (no module), then 3 tests passed.
- [X] T012 [US3] Clear the tickets on the logged-out page:
  - apps/admin/app/logged-out/page.test.tsx: add a test that calls `markRead` on an unread mock
    ticket, renders `<LoggedOutPage />` and checks that `useTicketsStore.getState().tickets` is
    `toBe(mockFeedback)` (FR-008). See it fail.
  - apps/admin/app/logged-out/page.tsx:
    - Render `<ResetTickets />` as the last child of `<main>`. The markup and text are otherwise
      unchanged, and the page stays a Server Component.
    - Replace the first comment's two lines with: "Outside the (admin) route group: no menu.
      Next.js only hides the admin pages when the admin leaves them, so ResetTickets clears the
      session's ticket changes here (spec 004, FR-008)." Keep the placeholder-page sentence.

  Run the three existing tests and the new one: all pass.

  **Result**: the new test failed first, then all 4 passed. `ResetTickets` renders no DOM node,
  so `<main>`'s centred grid is unchanged.
- [X] T013 [US3] In apps/admin/components/side-menu/SideMenu.integration.test.tsx, add the test
  "log-out clears ticket changes (spec 004, US3-1)":
  1. `resetTickets()` first. Log-out returns to the *mock data*, not to this file's three
     tickets, so the test starts from the mock data.
  2. `render(app())`.
  3. Open the mock ticket "When I click “Add website” nothing happens…" and check that Organic
     Growth shows "3 nye" and GEOtracking "2 nye".
  4. `rerender(<>{app()}<ResetTickets /></>)`, as arriving at the logged-out page does.
  5. Check that Organic Growth shows "4 nye", GEOtracking "3 nye", and the row shows "Ny" again.

  **Corrected during implementation**: the first version used this file's three tickets and
  expected "3 nye" after the reset. It got "4 nye", because the reset correctly restores the mock
  data. The test now starts from the mock data. 5 tests pass.
- [X] T014 [US3] Check User Story 3 in the browser (quickstart §3, log-out rows):
  1. Make changes (open, reply, issue), then click "Log ud": the page looks as before. Then click
     "Log ind igen": "4 nye", every ticket as at first load (US3-1, US3-2).
  2. Make a change, log out, press Back: as at first load (US3-3). Press Forward, then Back
     again: still as at first load.
  3. After logging back in, open an unread ticket: the counts drop by one (US3-4).
  4. At 834px, open the menu and click "Log ud". Return: same result, and the menu is closed.

  Record the results under this task.

  **Result (headless Firefox, dev server)**:

  | Step | Organic Growth / GEOtracking / SimpleSERP | Tickets A (#FB-1042), B (#FB-1041) |
  |------|-------------------------------------------|------------------------------------|
  | First load | "4 nye" / "3 nye" / "1 ny" | "Ny", "Ny" |
  | Reply to A, issue on B | "2 nye" / "2 nye" / none | "Færdig", "I gang" |
  | "Log ud": page shown without the menu, "Log ind igen" → `/` | – | – |
  | After "Log ind igen" | "4 nye" / "3 nye" / "1 ny" | "Ny", "Ny" |
  | Open A, "Log ud", Back | "4 nye" / "3 nye" / "1 ny" | "Ny", "Ny" |
  | Forward (logged-out page), Back | "4 nye" / "3 nye" / "1 ny" | "Ny", "Ny" |
  | Open B after returning | "3 nye" / "3 nye" / none | "Ny", read |
  | 834px: open the menu, "Log ud", "Log ind igen" | "4 nye" / "3 nye" / "1 ny"; menu closed | "Ny", "Ny" |

**Checkpoint**: All three stories work: no visible change, no wrappers, and log-out clears the
session.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Notes in earlier specs, the visual comparison and the quality gate

- [X] T015 [P] Add notes to spec 002 ([research R8](research.md#r8-documents-from-earlier-specs)),
  each starting with **Changed by spec 004 (2026-11-22)** and linking to this spec. Do not edit
  `spec.md` or `tasks.md`. In each file below, keep the original text and add the note after it,
  as spec 003 did:
  - specs/002-side-menu/research.md:
    - R1: ticket data now lives in a Zustand store (`lib/tickets/store.ts`), and the rejection of
      Zustand is superseded ([spec 004 R1](../004-zustand-ticket-store/research.md#r1-adding-zustand-constitution-principle-iv)).
    - R2: the mock tickets enter in the store, and the containers read it (spec 004 R3, R4).
    - R3: leaving the group did not unmount the provider (Activity). Log-out now clears the store
      via `ResetTickets` (spec 004 R5).
  - specs/002-side-menu/data-model.md, "State split": the tickets' owner is
    `lib/tickets/store.ts`, and they are cleared on arrival at `/logged-out`
    ([spec 004 data model](../004-zustand-ticket-store/data-model.md)).
  - specs/002-side-menu/contracts/components.md: notes under the layout snippet, "Ticket state"
    and `InboxContainer`, pointing to [spec 004's contract](../004-zustand-ticket-store/contracts/components.md).
  - specs/002-side-menu/plan.md: notes on the Constitution IV row ("React context instead of a
    state library") and on the `TicketsProvider/` lines in the structure tree.

  **Result**:
  - `research.md` got notes in R1, R2 and R3, plus R11 (testing), which also named the
    provider.
  - `data-model.md` got one note under the State split table.
  - `contracts/components.md` got notes after the layout snippet, after "Ticket state" (marked
    as removed) and after the inbox changes.
  - `plan.md` got notes after the Constitution Check and after the structure decision.
  - Original text kept everywhere.
- [X] T016 [P] Add notes to specs 001 and 003, in the same style as T015:
  - specs/001-feedback-inbox/contracts/components.md and specs/001-feedback-inbox/data-model.md:
    in the existing "Superseded by spec 002" notes, add that the tickets now live in the store
    from spec 004 rather than `TicketsProvider`.
  - specs/003-search-top-bar/research.md: notes in the intro bullet "Ticket data lives in
    `TicketsProvider`", in R1's "Put it in `TicketsProvider`" alternative, and in R9's "Ticket
    changes live in `TicketsProvider`".
  - specs/003-search-top-bar/data-model.md, Lifecycle: "Searching never dispatches to
    `TicketsProvider`" gets a note that it now means the ticket store.

  **Result**: notes added in all four files. The spec 003 notes are short italic sentences at
  the end of the existing bullets. The R9 note also points to the log-out finding in spec 004
  R5.
- [X] T017 Visual comparison (SC-005, quickstart §4):
  1. Take the "after" screenshots of `/`, `/platforms/geotracking` and `/settings` at 1440px and
     834px wide, at 2× pixel density, on a fresh load. Save them to
     `~/Documents/Projects/feedback-screenshots/004-zustand/after/{home-page-inbox,platforms,settings}/{1440px,834px}.png`.
     Headless Firefox with `browsingContext.setViewport` and `devicePixelRatio: 2` works, or the
     user can take them by hand as for `before/`.
  2. Compare each pair by viewing both images. Allowed: small size differences from hand
     cropping, and the Next.js development badge. Anything else is a failure to investigate.

  Record the result per pair under this task.

  **Result**: the "after" set was taken with headless Firefox at 2× (1440×800 and 834×720 CSS
  px), saved under `after/` with the same names. Every pair matches:

  | Page | 1440px | 834px |
  |------|--------|-------|
  | Inbox | ✅ Same counts (4/3/1, "Alle 16", "Færdig 5"), rows, badges, dates and layout. Long titles are cut a few characters earlier, because the "before" window was about 1470px wide (2940px image) | ✅ Same |
  | GEOtracking | ✅ Same, including the "1 Insight" development badge over the user block | ✅ Same |
  | Indstillinger | ✅ Same, with "Indstillinger" highlighted | ✅ Same |
- [X] T018 Quality gate, in `apps/admin`: `npm run lint`, `npx tsc --noEmit`, `npx vitest run`
  and `npm run build` all pass, and the build prerenders every route as before. Record the test
  count against the baseline (38 files, 278 tests): minus the 3 `TicketsProvider` tests, plus the
  new store, `ResetTickets`, logged-out page and integration tests. Check that no existing test
  name disappeared other than the three provider tests.

  **Result**: all four pass.
  - **Lint**: clean.
  - **`tsc`**: clean.
  - **Vitest**: 39 files, 288 tests. That is 278, minus 3 provider tests, plus 13 new ones: 8
    store, 3 `ResetTickets`, 1 logged-out page and 1 integration.
  - **Test names**: compared between `HEAD` and the working tree. Only the three
    `TicketsProvider` tests are gone.
  - **Build**: the same routes as before. `/`, `/logged-out`, `/settings` and both platform
    pages are static, and `/platforms/[platform]` is partially prerendered.
- [X] T019 Walk through the rest of [quickstart.md](quickstart.md):
  - §3 rows not covered by T008 and T014, such as two tabs keeping their own changes.
  - Confirm `npm ls zustand` shows `zustand@5.1.0`.

  Then mark every task `[X]` with a short result note, and report open points to the user.

  **Result**:
  - **Two tabs** (headless Firefox): opening a ticket in tab 1 gives "3 nye" there, while tab 2
    keeps "4 nye". Logging out in tab 2 leaves tab 1 at "3 nye".
    - The first attempt clicked while tab 1 was in the background and saw no change. Bringing
      each tab to the front before using it fixed that. This is a quirk of the check, not of the
      app.
  - **`npm ls zustand`**: `zustand@5.1.0`.
  - **T010 audit, re-run after US3**:
    - No provider left.
    - `mock-feedback` is imported only by the store and tests.
    - The store is imported only by the two containers, `ResetTickets`, `vitest.setup.ts` and
      tests.
    - `git status` lists only planned files. Presentational components are unchanged, apart from
      one comment in `Inbox.tsx`.
  - **Nothing committed.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 is done. T002 has no dependencies and blocks everything that imports
  `zustand`.
- **Foundational (Phase 2)**: T003 needs T002. T004 needs T003. Together they block every story.
- **US1 (Phase 3)**: T005 → T006 → T007 → T008, in order. T005 must come first so that the tests
  fail before T006 (TDD). T007 needs T006, otherwise the side menu would read an empty provider.
- **US2 (Phase 4)**: needs US1.
  - T009 edits `store.test.ts`, so it needs T003.
  - T010 audits the finished code, so run it again after US3 if US3 is done later.
- **US3 (Phase 5)**:
  - T011 needs only Phase 2, so it can run in parallel with US1.
  - T012 needs T011.
  - T013 needs T011 and T005 (same test file as T005's integration changes).
  - T014 needs T007 and T012.
- **Polish (Phase 6)**:
  - T015 and T016 can run in parallel once the stories are done.
  - T017 needs T007 and T012 (the final code).
  - T018 needs everything except T019. T019 comes last.

### User Story Dependencies

- **US1 (P1)**: needs Phase 2 only.
- **US2 (P2)**: verifies the state after US1. Its isolation test (T009) needs only Phase 2.
- **US3 (P3)**: its component (T011) needs only Phase 2. Wiring it into the page and the
  integration test needs US1's test-setup change (T005).

### Within Each User Story

- Tests first, see them fail, then the code.
- These tasks edit the same file and are never parallel with each other:
  - `store.test.ts`: T003, T009
  - `SideMenu.integration.test.tsx`: T005, T013
  - `app/logged-out/page.tsx` and its test: T012 only

### Parallel Opportunities

- T011 (the `ResetTickets` component and test) alongside T005–T007
- T015 and T016 (different spec folders)

---

## Parallel Example: User Story 3 alongside User Story 1

```bash
# After Phase 2, two independent tracks:
Task: "T005–T007: switch tests, containers and layout to the store (US1)"
Task: "T011: ResetTickets component + test in apps/admin/components/ResetTickets/ (US3)"
# Then, in order:
Task: "T012: render ResetTickets on apps/admin/app/logged-out/page.tsx (+ test)"
Task: "T013: log-out integration test in SideMenu.integration.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: install Zustand. The screenshots are already taken.
2. Phase 2: build the store and the reset between tests. Validate: 278 tests plus the store
   tests pass.
3. Phase 3: US1. Validate: every test passes with unchanged assertions, and the browser shows no
   difference. This is the MVP. The provider is gone, and the code is already easier to read.

### Incremental Delivery

1. Setup and Foundational: the store exists, unused.
2. Add US1: the app runs on the store (MVP).
3. Add US2: isolation proven, wrappers audited.
4. Add US3: log-out clears the session.
5. Polish: notes in earlier specs, screenshots, quality gate, quickstart.

Commit only when the user asks.

---

## Notes

- [P] tasks = different files, no dependencies on unfinished tasks
- The constitution is not amended. Principle IV is met by the dependency table in
  [plan.md](plan.md#new-dependencies-constitution-iv).
- If a second store is ever added, switch the test reset to Zustand's `__mocks__/zustand.ts`
  approach ([research R6](research.md#r6-test-isolation-fr-010)).
- When Convex replaces the mock data, revisit the global store
  ([research R2](research.md#r2-one-global-store-not-one-per-request)).
