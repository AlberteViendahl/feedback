---

description: "Task list for the Search Top Bar feature"
---

# Tasks: Search Top Bar

**Input**: Design documents from `/specs/003-search-top-bar/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: Included. Constitution VI requires Vitest tests for all new logic and components in the
same change. Within each task, write or update the test file first, see it fail, then implement.

**Organization**:

- Phase 1 fetches the search icon from Figma.
- Phase 2 renames the unused bar class.
- User Story 1 makes search work, with the bar styled for wide windows.
- User Story 2 adds the narrow-window layout and checks every width in a real browser.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1–US2 from spec.md)

## Conventions for every task

- **Paths and commands**: paths are relative to the repository root; commands run from
  `apps/admin`.
- **Next.js**: no Next.js APIs are added, so there is no Next.js guide to read. If one becomes
  necessary, read its guide in `apps/admin/node_modules/next/dist/docs/` first
  (`apps/admin/AGENTS.md`).
- **Folder convention** (spec 001): the main component sits at the root of its feature folder,
  each sub-component has its own folder named after it (`SearchBar/SearchBar.tsx`), and there
  are no `index.ts` files. Import by full path, e.g. `@/components/Icons/Icon`.
- **Types**: only from `apps/admin/lib/types.ts`. View-state types stay in
  `apps/admin/lib/inbox/state.ts`.
- **Styling** (Constitution I):
  - Use only classes and tokens from `apps/admin/app/globals.css`.
  - The values to use are in [research R7](research.md#r7-visual-values-and-the-search-icon)
    and the CSS table in [contracts](contracts/components.md#css-appglobalscss-changed).
- **Copy** in Danish, exactly as in [research R8](research.md#r8-copy-danish).
- **Untrusted input**: the admin's text is never turned into a `RegExp`, and nothing is rendered
  as HTML (Constitution III).
- **Tests**:
  - Import explicitly from `vitest`, `@testing-library/react` and `@testing-library/user-event`.
  - Use the fixtures in `apps/admin/lib/inbox/test-fixtures.ts`, adding tickets with
    `makeTicket` when needed.
  - Use `vi.setSystemTime` only; never fake timers together with `userEvent`.
- **Stale CSS on the dev server**: if a CSS change does not show, make a real content change to
  `globals.css` (not `touch`) or restart `next dev` (spec 002).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: The search icon from Figma

- [X] T001 Download the search icon to apps/admin/public/icons/search.svg:
  1. Load the `figma:figma-design-to-code` skill and create a Figma session for file
     `Tw9qt246dOOdNdSOMXx65z`.
  2. Call `get_design_context` on node `323:1707` (the top bar) and `curl -L` the asset of node
     `323:1710` ("Ikon – search", stroke `#888888`) to that path.
  3. If the Figma MCP still reports the Starter-plan call limit, stop and ask the user to export
     layer `323:1710` as SVG at 1x from the Figma app into that path.
  4. Do not copy or recolour `nav-search.svg`, and do not edit the SVG (research R7).
  5. Add `search: { width, height }`, using the SVG's root `width` and `height`, to the `ICONS`
     map in apps/admin/components/Icons/Icon.tsx.

  **Done differently (2026-11-18)**: Figma was still rate-limited, and the user chose to copy
  `nav-search.svg` with its stroke changed from `#484848` to `#888888` instead of exporting the
  layer. Replace `search.svg` with the Figma export of `323:1710` when Figma is available.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Free the bar's class name from the similarly named `.top-bar` (spec 002) and add the
field width token. Nothing visible changes.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 In apps/admin/app/globals.css:
  - Rename the unused class `.topbar` to `.search-bar`.
  - Rename the token `--topbar-height` to `--search-bar-height`.
  - Add `--search-width: 420px; /* search field (Figma 323:1709) */` to the Layout tokens.
  - Check that `grep -rn "topbar" apps/admin/app apps/admin/components` finds nothing else
    (research R6).

**Checkpoint**: `npm run lint` and `npx vitest run` pass, and the app looks unchanged

---

## Phase 3: User Story 1 – Find feedback by typing (Priority: P1) 🎯 MVP

**Goal**: A search bar above the inbox toolbar. It narrows the ticket list with every keystroke
and combines with the category filter, the All/Done filter and the sort order. It is styled as
in the design for windows at least 1024px wide.

**Independent Test**: Open `/` at 1440px and run the searches in
[quickstart §3](quickstart.md#3-manual-checks-with-the-mock-data). "anna" shows #FB-1042 and
#FB-1030. "a.b" shows "Ingen feedback matcher søgningen.". Escape brings back the full list.

- [X] T003 [P] [US1] Write apps/admin/lib/inbox/search.test.ts, then create
  apps/admin/lib/inbox/search.ts with `getSearchWords(search)` and `matchesSearch(ticket, words)`
  as specified in [contracts](contracts/components.md#pure-functions) and
  [data-model.md](data-model.md).

  **Implementation**:
  - Use `toLowerCase()`.
  - The only regex is the fixed `split(/\s+/)`.
  - Join the searched details with `"\n"`:
    - `description`
    - `formatTicketNumber(number)`
    - `sender.name`, skipped when undefined
    - `sender.email`
    - `sender.company`
    - `PLATFORM_LABELS[context.platform]` from `@/lib/platforms`
    - `getPagePath(context.pageUrl)`
  - A ticket matches when every word is found with `includes`.

  **Tests** (use `makeTicket`):
  - `getSearchWords`:
    - `""` and `"   "` give `[]`.
    - `"  Anna   Overview "` gives `["anna", "overview"]`.
    - Tabs and newlines also split.
  - `matchesSearch` matches:
    - `[]` matches everything.
    - Each searched detail matches on its own:
      - a word only on the second line of a two-line description
      - `"#fb-1000"` and `"1000"`
      - `"holm"`
      - `"company.dk"`
      - `"aps"`
      - `"geotracking"`
      - `"/overview"`
  - `matchesSearch` does not match:
    - browser `"chrome"`
    - OS `"macos"`
    - user ID `"4821"`
    - an attachment file name
    - a reply's text
  - All words must match: `["anna", "overview"]` matches but `["anna", "csv"]` does not.
  - Characters match literally:
    - `"a.b"` does not match a text containing `"axb"`.
    - `"*"`, `"("` and `"<b>"` match only texts containing them.
  - Danish letters:
    - `"ø"` matches a name with `"Ø"`.
    - `"ø"` does not match `"oe"`.
  - A sender without a name matches by email.
  - The page address `javascript:alert(1)` matches `"javascript"`.
  - Filtering 1,000 generated tickets with `["anna", "overview"]` takes under 200 ms, measured
    with `performance.now()` (SC-003).
- [X] T004 [P] [US1] In apps/admin/lib/inbox/state.ts, per [data-model.md](data-model.md):
  - Add `search: string` to `InboxView`.
  - Add `{ type: "setSearch"; value: string }` to `InboxViewAction`.
  - Add `search: ""` to `createInitialView()`.
  - Add a reducer case that returns `{ ...view, search: action.value }`.

  Update apps/admin/lib/inbox/state.test.ts:
  - The initial view includes `search: ""`.
  - `setSearch` stores the untrimmed value and leaves every other field equal.
  - `select` and the filter setters leave `search` unchanged.
- [X] T005 [US1] In apps/admin/lib/inbox/select.ts (needs T003 and T004):
  - Add a private
    `inScope(tickets, view: Pick<InboxView, "categoryFilter" | "search">)`. It applies the
    category filter, then `matchesSearch` with `getSearchWords(view.search)`, computing the
    words once.
  - `getVisibleTickets` uses `inScope`, then the All/Done filter, then sorts.
  - Change `getCounts` to `getCounts(tickets, view)` and make it count within `inScope`.
  - Leave `getSelectedTicket` unchanged.
  - In apps/admin/components/inbox/Inbox.tsx, change the call to `getCounts(tickets, view)`.

  Update apps/admin/lib/inbox/select.test.ts:
  - The existing `getCounts` cases now pass `{ categoryFilter: category, search: "" }`.
  - New cases with the fixture:
    - `"fejl"` shows t1 and t3.
    - `"fejl"` plus the done filter shows t3.
    - `"fejl"` plus category `idea` shows nothing.
    - `"FØRSTE"` shows t1.
    - The sort order still applies to search results.
    - The counts follow the search: `"forslag"` gives `{ all: 2, done: 1 }`, and with category
      `bug` it gives `{ all: 0, done: 0 }`.
    - A selected t1 gives `null` while the search is `"forslag"`, and t1 again when the search
      is `""` (FR-010, FR-012).
- [X] T006 [US1] Add the prop `isSearching: boolean` to
  apps/admin/components/inbox/TicketList/TicketList.tsx. The empty state shows "Ingen feedback
  matcher søgningen." when it is true, and "Ingen feedback matcher filtrene." otherwise.
  - In apps/admin/components/inbox/Inbox.tsx, pass
    `isSearching={getSearchWords(view.search).length > 0}`. This comes after T005 because both
    tasks edit `Inbox.tsx`.
  - Update apps/admin/components/inbox/TicketList/TicketList.test.tsx: the existing renders pass
    `isSearching={false}`, and a new case checks the search message for `isSearching` (FR-011).
- [X] T007 [P] [US1] Write apps/admin/components/inbox/SearchBar/SearchBar.test.tsx, then create
  apps/admin/components/inbox/SearchBar/SearchBar.tsx with `SearchBarProps` and the markup in
  [contracts](contracts/components.md#search-bar-componentsinboxsearchbarsearchbartsx).
  - **Markup**:
    - `<div className="search-bar" role="search">`
    - Inside it, `<label className="search-field">` containing
      `<Icon name="search" className="search-field__icon" />` and
      `<input type="search" className="search-input" aria-label="Søg i feedback"
      placeholder="Søg i feedback, brugere, sider…">`.
    - No `"use client"` directive, like the other inbox sub-components; `Inbox` is the client
      boundary.
  - **Behaviour**:
    - `onChange` receives `event.target.value` untrimmed.
    - `onKeyDown`: Escape with a non-empty value calls `preventDefault()` and `onChange("")`.
    - No `<form>`.
  - **Tests** (use a small stateful harness around `SearchBar` with a spy):
    - The `search` landmark contains a `searchbox` named "Søg i feedback" with the exact
      placeholder.
    - Typing "ab" reports "a", then "ab".
    - Escape on "abc" reports `""` once, and focus stays in the field.
    - Escape on an empty field reports nothing.
    - Enter reports nothing (FR-006, FR-013, FR-016, FR-017).
- [X] T008 [P] [US1] Style the bar for windows at least 1024px wide in
  apps/admin/app/globals.css (needs T002). Use the values in
  [research R6/R7](research.md#r7-visual-values-and-the-search-icon) and cite Figma `323:1707` and
  `323:1709` in a comment.
  - `.search-bar`:
    - `display: flex`, `align-items: flex-start`
    - `padding: 11px var(--page-padding) 0`
    - `margin: calc(var(--page-padding) * -1) calc(var(--page-padding) * -1) var(--page-padding)`
    - keep its height, `--surface` background and `--border-color` bottom line
  - `.search-field`: `position: relative; display: block; width: var(--search-width); max-width: 100%`
  - `.search-field__icon`: `position: absolute; left: 16px; top: 50%; transform: translateY(-50%); pointer-events: none`
  - `.search-input`: add `width: 100%`, keeping the existing 39px height, 42px left padding,
    colours and radius.
  - `.search-input::-webkit-search-cancel-button`: `-webkit-appearance: none; appearance: none`.
- [X] T009 [US1] Render the bar in apps/admin/components/inbox/Inbox.tsx (needs T005–T008).
  Return a fragment: `<SearchBar value={view.search} onChange={(value) => dispatch({ type:
  "setSearch", value })} />`, followed by the existing `<section className="inbox">`.

  Extend apps/admin/components/inbox/Inbox.test.tsx, using the provider and fixture, with one
  test per item:
  - **Placement**: the `search` landmark is the element directly before the section named
    "Feedback-indbakke" (research R6).
  - **US1-1**: typing "forslag" shows "Et forslag" and "Gammelt forslag" without Enter.
  - **US1-3**: "FØRSTE" shows "Første fejl".
  - **US1-4**: "første fejl" shows one row, and "fejl forslag" shows none.
  - **US1-5**: with category "Fejl", "Færdig" and "fejl", only "Løst fejl" shows, and the
    buttons read "Alle 2" and "Færdig 1".
  - **US1-6**:
    - "zzz" shows "Ingen feedback matcher søgningen.".
    - Spaces only show all five rows and no message.
  - **US1-7**: Escape restores all rows while "Færdig" stays pressed.
  - **US1-8**: with "Første fejl" open (heading "#FB-1005"), searching "forslag" shows "Vælg en
    feedback i listen for at se detaljerne.", and clearing the search shows "#FB-1005" again.
  - **FR-014**: searching for "første" and clearing it leaves t1's "Ny" badge in place.
  - **FR-015**: remounting `InboxContainer` inside the same provider (change its `key` with
    `rerender`) empties the field.
  - **Principle III**:
    - Add a ticket made with `makeTicket` whose description is
      `<img src=x onerror=alert(1)>`.
    - Searching "<img" shows that text literally.
    - `document.querySelector("img[src='x']")` is null.

  Update apps/admin/components/inbox/Inbox.keyboard.test.tsx so that Tab first reaches
  `getByRole("searchbox", { name: "Søg i feedback" })`, then "Alle 5", "Færdig 2", the category
  select and the sort button. The rest of the test stays unchanged (FR-016, SC-007).

**Checkpoint**: At 1440px the bar matches [design/top-bar.png](design/top-bar.png) apart from the
Danish wording, every US1 scenario works, and `npx vitest run`, `npx tsc --noEmit` and
`npm run lint` pass

---

## Phase 4: User Story 2 – Search on any screen size (Priority: P2)

**Goal**: The bar keeps spanning the content area at every wide width. Below 1024px the field
fills the width under the menu-button bar, as in the tablet frame. No width from 320px up
scrolls sideways.

**Independent Test**: Run the browser check in T011 at 2560, 1440, 1024, 834, 390 and 320px.
Every assertion passes, and the 834px screenshot matches
[the tablet design](../002-side-menu/design/page-tablet.png).

- [X] T010 [US2] Add the narrow-window rules to apps/admin/app/globals.css (needs T008, which
  edits the same file). Put them inside the existing
  `@media (width < theme(--breakpoint-lg))` block, with a comment citing `page-tablet.png` and
  Figma `356:435` (research R7).
  - `.search-bar`:
    - `height: auto`
    - `padding: 0 var(--page-padding-compact) 12px`
    - `margin: calc(var(--page-padding-compact) * -1) calc(var(--page-padding-compact) * -1) var(--page-padding-compact)`
    - `border-bottom: 0`
  - `.search-field`: `width: 100%`
  - `.search-field__icon`: `left: 13px`
  - `.search-input`: `height: 41px; padding-left: 36px; border-color: transparent`
- [X] T011 [US2] Check the layout in a real browser, because jsdom does no layout. With
  `npm run dev` running, drive headless Firefox over WebDriver BiDi (as in spec 002:
  `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`, a tab from `browsingContext.create`, then `setViewport`).
  Use the session scratchpad for scripts and screenshots, and load `/` at 2560, 1440, 1024, 834,
  390 and 320px wide.
  - **Every width**:
    - `document.documentElement.scrollWidth <= innerWidth`.
    - After typing 200 characters into the field, that still holds and the field's width is
      unchanged (FR-004, US2-4, SC-006).
  - **At least 1024px**:
    - `.search-bar` spans `main` exactly: same left and right edges.
    - The bar is 63px high.
    - `.search-field` is 420px wide and starts 32px from `main`'s left edge (FR-002, US2-1,
      US2-2).
  - **Below 1024px**:
    - The field's top equals `.top-bar`'s bottom.
    - The field is `innerWidth − 48` px wide and 41px high.
    - The white bar ends 12px below the field (FR-003, US2-3).
  - **Screenshots**: save them at 1440 and 834px for T014.
  - Fix any failure in apps/admin/app/globals.css.

  **Result (2026-11-18)**:
  - Passes at 2560, 1440, 1024 and 834px.
  - At 390 and 320px the bar and field fit, but the page still scrolls sideways (447px). The
    cause is the inbox toolbar from spec 001, which stays on one row: the sort button and,
    at 320px, the category select overflow. The toolbar is unchanged by this feature, so
    SC-006 is not met at phone widths until the toolbar can wrap. This is a follow-up that
    needs a mobile design.
  - The dev server served stale CSS after T010. A real content change to `globals.css`
    fixed it.

**Checkpoint**: Both stories work. All assertions in T011 pass at the six widths

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation sync, audit, visual check and the quality gate

- [X] T012 [P] Update the inbox contracts from earlier specs to point to
  specs/003-search-top-bar/contracts/components.md, without duplicating it:
  - specs/001-feedback-inbox/contracts/components.md: the `getCounts` signature and
    `TicketListProps`.
  - specs/002-side-menu/contracts/components.md: the `getCounts` line, which is no longer
    "unchanged".
- [X] T013 [P] Audit apps/admin, excluding node_modules and .next, and fix anything found
  (Constitution III, V):
  - `grep -rn "dangerouslySetInnerHTML"` finds nothing.
  - apps/admin/lib/inbox/search.ts contains no `RegExp` constructor and no regex other than the
    fixed `/\s+/`.
  - apps/admin/components/inbox/SearchBar/SearchBar.tsx imports neither mock data nor
    `useTickets`.
  - `grep -rn "topbar" apps/admin/app apps/admin/components` finds nothing.
- [X] T014 Compare the screenshots from T011:
  - at 1440px with specs/003-search-top-bar/design/top-bar.png and
    specs/002-side-menu/design/page-workspace.png
  - at 834px with specs/002-side-menu/design/page-tablet.png

  If the Figma MCP limit allows, also call `get_screenshot` on nodes `323:1707` and `356:435`,
  and re-check the narrow-window values in research R7. Fix differences via
  apps/admin/app/globals.css (SC-005). Allowed differences:
  - Danish wording
  - mock-data contents
  - the page heading, key-figure cards and "new feedback" banner, which are separate features

  **Result**:
  - The colours and positions at 1440px match `top-bar.png` pixel for pixel: line `#dddddd`
    at y=62, field `#f0f2f8` with a `#dddddd` border at x=32/y=11, icon `#888888`.
  - At 834px the layout matches `page-tablet.png`.
  - Figma `get_screenshot` was not possible, because the Starter-plan limit was still reached.
- [X] T015 Run the quality gate from `apps/admin`: `npm run lint`, `npx tsc --noEmit`,
  `npx vitest run` and `npm run build`.
- [X] T016 Walk through every section of specs/003-search-top-bar/quickstart.md and fix any
  failure. The VoiceOver check in §5 needs a person: list it in the hand-over rather than marking
  it done.

  **Result**:
  - Every mock-data search in §3 and the steps after it pass in headless Firefox.
  - Step 5 failed at first: the search and filters survived inbox → Indstillinger → inbox,
    because Next.js keeps the hidden page mounted (Activity). Fixed with a `reset` action in a
    `useLayoutEffect` cleanup ([research R9](research.md#r9-nextjs-keeps-a-page-mounted-after-you-navigate-away-found-during-implementation)),
    covered by a new `<Activity>` test and re-checked in the browser. This also fixes spec
    002's FR-017.
  - Corrected §5 step 1: Tab passes the side menu before it reaches the search field.
  - Still open for a person: the VoiceOver check (§5 step 4).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 may need the user if Figma is rate-limited. Nothing
  else waits for it except the icon in T007, and T007's tests do not depend on the SVG file.
- **Foundational (Phase 2)**: T002 has no dependencies. It blocks T008, which renames and
  extends the same classes.
- **US1 (Phase 3)**:
  - T003, T004, T007 and T008 can run in parallel; T008 needs T002.
  - T005 needs T003 and T004.
  - T006 needs T005, because both edit `Inbox.tsx`.
  - T009 needs T005–T008, and T001 for the icon to load in the browser.
- **US2 (Phase 4)**:
  - T010 needs T008 (same file).
  - T011 needs T009 and T010.
- **Polish (Phase 5)**: needs both stories. T012 and T013 can run in parallel. T014 needs T011's
  screenshots. T015 and T016 come last.

### Within Each User Story

- Pure functions (`search.ts`, `state.ts`) come before the selectors, then the components, then
  the `Inbox` wiring and its integration tests.
- These tasks edit the same file and are never parallel with each other:
  - `Inbox.tsx`: T005, T006, T009
  - `globals.css`: T002, T008, T010

### Parallel Opportunities

- US1: T003, T004, T007 and T008 (four different files)
- Polish: T012 and T013

---

## Parallel Example: User Story 1

```bash
# Four independent files:
Task: "search.ts + search.test.ts in apps/admin/lib/inbox/"
Task: "InboxView.search + setSearch in apps/admin/lib/inbox/state.ts (+ test)"
Task: "SearchBar component + test in apps/admin/components/inbox/SearchBar/"
Task: "Wide-window bar styles in apps/admin/app/globals.css"
# Then, in order:
Task: "Selectors + getCounts(tickets, view) in apps/admin/lib/inbox/select.ts (+ Inbox.tsx call)"
Task: "TicketList isSearching (+ Inbox.tsx prop)"
Task: "Render SearchBar in Inbox.tsx; Inbox and keyboard tests"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: the icon. Ask the user for an export if Figma is still rate-limited.
2. Phase 2: rename the class and add the token. Validate: nothing visible changes.
3. Phase 3: US1. Validate: search works and looks right at 1440px. This is the MVP.

### Incremental Delivery

1. Setup + Foundational: icon and class name ready.
2. Add US1: search on desktop (MVP).
3. Add US2: tablet and phone layout, checked at six widths.
4. Polish: docs sync, audit, visual check, quality gate, quickstart.

Commit only when the user asks.

---

## Notes

- [P] tasks = different files, no dependencies on unfinished tasks
- Figma asset URLs expire after 7 days. T001 downloads the icon; code never references the URL.
- `AppShell`, `TopBar`, the side menu and the other pages must not change in this feature. Among
  the inbox's sub-components, only `TicketList` changes, and only by gaining `isSearching`.
