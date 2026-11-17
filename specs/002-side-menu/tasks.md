---

description: "Task list for the Side Menu feature"
---

# Tasks: Side Menu

**Input**: Design documents from `/specs/002-side-menu/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: Included. Constitution VI requires Vitest tests for all new logic and components in
the same change. Within each task, write or update the test file first, see it fail, then
implement.

**Organization**: Phase 2 moves the ticket data into a shared provider and the admin pages into a
route group (the inbox keeps working exactly as before). Each user-story phase then adds one slice
of the menu.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1–US3 from spec.md)

## Conventions for every task

- Paths are relative to the repository root; commands run from `apps/admin`.
- Before writing Next.js code, read the relevant guide in
  `apps/admin/node_modules/next/dist/docs/` (`apps/admin/AGENTS.md`). Cache Components is on:
  no `dynamicParams`, no clock reads during render, `usePathname` in a layout needs `<Suspense>`
  ([research R4/R5](research.md#r4-platform-pages-with-cache-components)).
- Folder convention (spec 001): main component at the root of its feature folder, one folder per
  sub-component named after it (`NavItem/NavItem.tsx`), no `index.ts` files. Import other
  components by full path, e.g. `@/components/Icons/Icon`, `../NavItem/NavItem`.
- Types only from `apps/admin/lib/types.ts`. Style only with classes and tokens from
  `apps/admin/app/globals.css`; take missing values from Figma node `323:2095` and add them there
  first (Constitution I).
- User-facing text in Danish per [research R10](research.md#r10-danish-copy-and-page-titles);
  URLs and code in English.
- Presentational components take only the props in
  [contracts/components.md](contracts/components.md). Only `app/(admin)/layout.tsx` and pages
  import mock data.
- Tests: explicit imports from `vitest`, `@testing-library/react`, `@testing-library/user-event`;
  mock `usePathname` with `vi.mock("next/navigation", () => ({ usePathname: () => "/" }))` where
  needed. Use `vi.setSystemTime` only, never fake timers together with `userEvent`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Design assets for the menu

- [X] T001 Download the side-menu icons into apps/admin/public/icons/: load the `figma:figma-design-to-code` skill, create a Figma session for file `Tw9qt246dOOdNdSOMXx65z`, call `get_design_context` on node `323:1676` (the side menu inside the page frame `323:1675`), and `curl -L` the asset of each node (matched by `data-node-id`, since several layers share the name "Status") to: `323:1683` → `settings.svg`, `323:1702` → `logout.svg`, `323:1687` (28 px circle behind GEOtracking) → `platform-geotracking.svg`, `323:1688` (globe) → `nav-globe.svg`, `323:1692` (28 px circle behind SimpleSERP) → `platform-simpleserp.svg`, `323:1693` (search) → `nav-search.svg`, `323:1706` (28 px dark workspace circle) → `workspace-avatar.svg`, `323:1698` (30 px circle behind the user's initial) → `user-avatar.svg`. Do not edit the SVGs. Then add each name with its root `width`/`height` to the `ICONS` map in apps/admin/components/Icons/Icon.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and platform data, the ticket provider, the inbox refactor and the
`(admin)` route group. At the checkpoint the app behaves exactly as before, but its ticket data
lives in a provider that the menu can read.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `Workspace` (`_id`, `name`, `platforms: Platform[]`) and `AdminUser` (`_id`, `name`, `role`, `workspaceId`) to apps/admin/lib/types.ts as in [data-model.md](data-model.md)
- [X] T003 [P] Write apps/admin/lib/platforms.test.ts, then create apps/admin/lib/platforms.ts with `PLATFORMS` (`["geotracking", "simpleserp"] as const`), `PLATFORM_LABELS` (moved from apps/admin/lib/inbox/format.ts) and `isPlatform(value)`. Remove `PLATFORM_LABELS` from format.ts and its test (apps/admin/lib/inbox/format.test.ts), and change the imports in apps/admin/components/inbox/TicketRow/TicketRow.tsx and apps/admin/components/inbox/ContextTable/ContextTable.tsx to `@/lib/platforms`. Tests: labels, `isPlatform` true for both ids and false for `"foo"`, `""`, `"GEOtracking"`
- [X] T004 [P] Create apps/admin/lib/mock-workspace.ts exporting `mockWorkspace` and `mockUser` exactly as in [data-model.md](data-model.md) ("Mock data")
- [X] T005 Write apps/admin/lib/tickets/state.test.ts, then create apps/admin/lib/tickets/state.ts with `TicketAction` and `ticketsReducer(tickets, action)` per [data-model.md](data-model.md) ("Ticket actions"), moving the ticket rules out of apps/admin/lib/inbox/state.ts. Tests (port the ticket cases from apps/admin/lib/inbox/state.test.ts): `markRead`; `sendReply` stores the trimmed text with `sentAt` and sets `done`, from `open` and from `in_progress`; `sendReply` is a no-op (returns the same array instance) for blank text or an existing reply; `createIssue` sets `in_progress`, keeps `done`, and is a no-op when already created; unknown ids are no-ops; the input array is never mutated
- [X] T006 Reduce apps/admin/lib/inbox/state.ts to view state per [data-model.md](data-model.md) ("Inbox view actions"): export `StatusFilter`, `CategoryFilter`, `SortOrder`, `InboxNotice`, `STANDARD_REPLY`, `InboxView`, `InboxViewAction` (incl. `showNotice`), `createInitialView()` and `inboxViewReducer()`; change apps/admin/lib/inbox/select.ts to `getVisibleTickets(tickets, view)` and `getSelectedTicket(tickets, view)` (`getCounts` unchanged). Update apps/admin/lib/inbox/state.test.ts (view cases only: initial view, select resets draft and notice, setters, editReply, showNotice) and apps/admin/lib/inbox/select.test.ts to the new signatures
- [X] T007 Write apps/admin/components/TicketsProvider/TicketsProvider.test.tsx, then create apps/admin/components/TicketsProvider/TicketsProvider.tsx (`"use client"`): a context holding `useReducer(ticketsReducer, initialTickets)`, `TicketsProvider({ initialTickets, children })` and `useTickets()` returning `{ tickets, dispatch }`, throwing `Error("useTickets must be used inside TicketsProvider")` outside it. Tests: children read the initial tickets; a dispatched `markRead` is visible to a second consumer; the error outside the provider
- [X] T008 Change apps/admin/components/inbox/Inbox.tsx to the `InboxProps` in [contracts/components.md](contracts/components.md): it renders the given `tickets`, keeps only view state with `useReducer(inboxViewReducer, undefined, createInitialView)`, and on select dispatches `select` and calls `onOpenTicket(id)`; on send (only when the open ticket has no reply and the trimmed draft is non-empty) calls `onSendReply(id, draft.trim(), Date.now())` inside the click handler and dispatches `showNotice("reply-sent")`; on create issue (only when not yet created) calls `onCreateIssue(id)` and dispatches `showNotice("issue-created")`. Create apps/admin/components/inbox/InboxContainer.tsx (`"use client"`) that reads `useTickets()` and passes `tickets` plus callbacks dispatching `markRead`, `sendReply`, `createIssue`. Update apps/admin/components/inbox/Inbox.test.tsx and apps/admin/components/inbox/Inbox.keyboard.test.tsx to render `<TicketsProvider initialTickets={fixtureTickets}><InboxContainer /></TicketsProvider>`; every existing assertion must still pass unchanged
- [X] T009 In apps/admin/app/globals.css add the app shell classes: `.app-shell` (flex row, `min-height: 100vh`), `.app-shell__menu` (`position: sticky; top: 0; height: 100vh; flex-shrink: 0`) and `.app-shell__content` (`flex: 1; min-width: 0; padding: var(--page-padding)`) (FR-001)
- [X] T010 Create the route group: move apps/admin/app/page.tsx to apps/admin/app/(admin)/page.tsx and make it render `<InboxContainer />` (no props, no mock import); create apps/admin/app/(admin)/layout.tsx (Server Component) that imports `mockFeedback` and renders `<TicketsProvider initialTickets={mockFeedback}><div className="app-shell"><div className="app-shell__menu" /><main className="app-shell__content">{children}</main></div></TicketsProvider>` (the menu slot is filled in T018). Read `route-groups.md` and `layout.md` in the bundled docs first
- [X] T011 In apps/admin/app/layout.tsx change `metadata.title` to `{ default: "Feedback · Admin", template: "%s · Feedback · Admin" }` (read the Metadata API docs for `title.template` first)

**Checkpoint**: `npx vitest run`, `npx tsc --noEmit`, `npm run lint` and `npm run build` pass; `/` shows the inbox exactly as before

---

## Phase 3: User Story 1 – See where I am and what is waiting (Priority: P1) 🎯 MVP

**Goal**: A full-height, sticky menu on every admin page with "Feedback · Admin", the workspace
and its platforms with live "new" counts, and the current page's item highlighted.

**Independent Test**: Open `/`: the menu shows the brand pill, "Organic Growth" (highlighted)
with "4 nye", "Platforme", GEOtracking "3 nye", SimpleSERP "1 ny"; opening an unread GEOtracking
ticket changes them to "2 nye" and "3 nye" at once.

- [X] T012 [P] [US1] Write apps/admin/lib/tickets/counts.test.ts, then create apps/admin/lib/tickets/counts.ts with `NewCounts`, `getNewCounts(tickets)` and `formatNewCount(n)` (`null` for 0, `"1 ny"` for 1, `"{n} nye"` otherwise). Tests: counts per platform and total from the fixture, every platform key present with 0, no unread → all zero, the three format cases
- [X] T013 [P] [US1] Write apps/admin/lib/side-menu/active-href.test.ts, then create apps/admin/lib/side-menu/active-href.ts with `getActiveHref(pathname, hrefs)` (exact match, else `null`). Tests: `/`, `/platforms/geotracking`, `/settings`, `/platforms/foo` → null, `/settings/extra` → null
- [X] T014 [P] [US1] Write apps/admin/components/side-menu/NavItem/NavItem.test.tsx, then create apps/admin/components/side-menu/NavItem/NavItem.tsx with the props in [contracts](contracts/components.md): a `next/link` `<Link>` with class `nav-item` (plus `nav-item--active` and `aria-current="page"` when active), the `icon`, the label in `.truncate-line`, and `formatNewCount(count)` right-aligned when not null. Tests: href, label, "3 nye", "1 ny", no count for 0 and for undefined, active class and `aria-current`
- [X] T015 [US1] Measure the menu in Figma node `323:2095` (and the screenshots in specs/002-side-menu/design/) and add the side-menu layout classes to apps/admin/app/globals.css: `.side-menu` (flex column filling `.app-shell__menu`, padding 12 px), the gap after the brand pill (10 px), `.side-menu__section-label` spacing for "Platforme" (≈10 px above, ≈13 px below), platform rows (28 px icon, 10 px gap to text, 41 px row pitch), a scrolling middle area (`flex: 1; min-height: 0; overflow-y: auto`) and a bottom area that never scrolls, count text color (`--text-subtle`, `--text-secondary` on the active row), and an `.icon-stack` helper that layers a glyph on its circle (like `.attachment__preview > *`). Use existing tokens where a value matches
- [X] T016 [US1] Write apps/admin/components/side-menu/SideMenu.test.tsx, then create apps/admin/components/side-menu/SideMenu.tsx (US1 part) with `SideMenuProps`: `<nav aria-label="Hovedmenu" className="side-menu">` containing the `.brand-pill` as a `<Link href="/">` ("Feedback" in `<strong>`, then "· Admin"), a `NavItem` for the workspace (`/`, `workspace-avatar.svg`, `counts.total`), the overline "Platforme" (`.text-overline`), then one `NavItem` per `workspace.platforms` entry (`/platforms/{id}`, `PLATFORM_LABELS[id]`, its circle with `nav-globe.svg` / `nav-search.svg` stacked on it, `counts.byPlatform[id]`), with `isActive` from `activeHref`. Tests: all texts and hrefs, counts, exactly one `aria-current="page"` for `activeHref="/"` and for `"/platforms/simpleserp"`, none for `null`
- [X] T017 [US1] Create apps/admin/components/side-menu/SideMenuContainer.tsx (`"use client"`) with `SideMenuContainerProps`: when `activeHref` is passed (including `null`) use it; otherwise read `usePathname()` and map it with `getActiveHref` over the menu's hrefs (`/`, each `/platforms/{id}`, `/settings`). Split the `usePathname` call into its own inner component so the hook is never called conditionally. Read counts with `getNewCounts(useTickets().tickets)` and render `SideMenu`
- [X] T018 [US1] In apps/admin/app/(admin)/layout.tsx replace the empty menu slot with `<aside className="app-shell__menu sidebar"><Suspense fallback={<SideMenuContainer workspace={mockWorkspace} user={mockUser} activeHref={null} />}><SideMenuContainer workspace={mockWorkspace} user={mockUser} /></Suspense></aside>` (research R5; read `use-pathname.md`, "Cache Components", first). Then write apps/admin/app/(admin)/layout.test.tsx (US1-1, FR-001): with `usePathname` mocked to `/`, render the layout with a child `<p>Indhold</p>`; assert the menu (`nav` named "Hovedmenu") sits inside `aside.app-shell__menu`, the child sits inside `main.app-shell__content`, and both are direct children of `.app-shell`. jsdom does not lay out pages, so this checks structure; the sticky behaviour itself is checked by hand in quickstart.md
- [X] T019 [US1] Write apps/admin/components/side-menu/SideMenu.integration.test.tsx rendering `<TicketsProvider initialTickets={fixtureTickets}><SideMenuContainer … /><InboxContainer /></TicketsProvider>` with `usePathname` mocked to `/`: the counts match the fixture's unread tickets; opening an unread ticket in the inbox lowers its platform's count and the total immediately (US1-5, SC-007); after sending a reply, setting "Færdig" and opening a ticket, unmounting and remounting `InboxContainer` (keep the provider mounted) keeps the reply and the opened state but resets the filter to "Alle" and closes the ticket (US1-6, US1-7)

**Checkpoint**: The menu shows on `/` with live counts; all tests pass

---

## Phase 4: User Story 2 – Move between workspace, platforms and settings (Priority: P1)

**Goal**: Every menu item leads to its own page with its own URL; the clicked item is highlighted;
unknown platforms show "Siden findes ikke" with the menu.

**Independent Test**: Click each item: the matching page opens, its heading names it, only that
item is highlighted; reload keeps the highlight; `/platforms/foo` shows the not-found page with
the menu and nothing highlighted.

- [X] T020 [P] [US2] Create apps/admin/app/(admin)/platforms/[platform]/page.tsx: `generateStaticParams` returning `PLATFORMS.map((platform) => ({ platform }))`; `generateMetadata` with the platform label as `title`; the async page awaits `params`, calls `notFound()` unless `isPlatform(platform)`, and renders `<h1 className="text-display">{PLATFORM_LABELS[platform]}</h1><p className="text-subtitle">Denne side er tom indtil videre.</p>` (read `dynamic-routes.md` "With Cache Components" and `not-found.md` first). Write apps/admin/app/(admin)/platforms/[platform]/page.test.tsx first: render `await Page({ params: Promise.resolve({ platform: "geotracking" }) })` and assert the heading "GEOtracking"; assert `Page({ params: Promise.resolve({ platform: "foo" }) })` rejects (the `notFound()` error); assert `generateStaticParams()` returns both platforms and `generateMetadata` returns the label as title (US2-2)
- [X] T021 [P] [US2] Write apps/admin/app/(admin)/settings/page.test.tsx (renders the heading "Indstillinger" and the placeholder text; `metadata.title` is "Indstillinger"; US2-3), then create apps/admin/app/(admin)/settings/page.tsx with `metadata.title = "Indstillinger"`, heading "Indstillinger" (`.text-display`) and "Denne side er tom indtil videre." (`.text-subtitle`)
- [X] T022 [P] [US2] Create apps/admin/app/(admin)/not-found.tsx (inside the admin layout, so the menu shows) and apps/admin/app/not-found.tsx (outside, no menu), both with heading "Siden findes ikke" (`.text-display`) and a `<Link href="/">Gå til indbakken</Link>`; Server Components only (bundled `not-found.md`). Write apps/admin/app/(admin)/not-found.test.tsx and apps/admin/app/not-found.test.tsx first: each renders the heading and a link named "Gå til indbakken" pointing to `/`. Right after this task, run `npm run build` and open `/platforms/foo` in `npm run dev` to confirm the admin not-found page renders with the menu; if not, move it to apps/admin/app/(admin)/platforms/[platform]/not-found.tsx (analysis U2)
- [X] T023 [US2] Extend apps/admin/components/side-menu/SideMenu.tsx with the bottom area: a `NavItem` "Indstillinger" (`/settings`, `settings.svg`, no count) pinned below the scrolling middle; update apps/admin/components/side-menu/SideMenu.test.tsx: the settings link exists and is the only active item for `activeHref="/settings"`
- [X] T024 [US2] Write apps/admin/components/side-menu/SideMenuContainer.test.tsx inside `TicketsProvider`, with `usePathname` mocked per test (`vi.mocked`): `/` highlights Organic Growth, `/platforms/geotracking` highlights GEOtracking, `/settings` highlights Indstillinger, `/platforms/foo` highlights nothing, and passing `activeHref={null}` never calls `usePathname`

**Checkpoint**: All pages reachable from the menu; `npm run build` lists `/platforms/geotracking`, `/platforms/simpleserp` and `/settings` as prerendered

---

## Phase 5: User Story 3 – See who I am logged in as and log out (Priority: P2)

**Goal**: The user block at the bottom of the menu, and a one-click simulated log-out to a page
without the menu.

**Independent Test**: The menu shows "H", "Hussein", "Admin · Organic Growth"; clicking the
log-out icon opens "Du er logget ud" without the menu; "Log ind igen" returns to the inbox.

- [X] T025 [P] [US3] Write apps/admin/components/side-menu/UserBlock/UserBlock.test.tsx, then create apps/admin/components/side-menu/UserBlock/UserBlock.tsx with `UserBlockProps`: `user-avatar.svg` with the user's first letter (upper-cased) layered on it (`.icon-stack`), the name (semibold, `.truncate-line`), `{role} · {workspaceName}` (`.text-meta`, `.truncate-line`), and a `<Link href="/logged-out" aria-label="Log ud">` containing `logout.svg`. Match Figma (avatar 30 px, 10 px gap, log-out icon right-aligned). Tests: initial, name, role line, the link's href and accessible name
- [X] T026 [US3] Extend apps/admin/components/side-menu/SideMenu.tsx: below the "Indstillinger" item, a `.divider` and `<UserBlock user={user} workspaceName={workspace.name} />`; update apps/admin/components/side-menu/SideMenu.test.tsx for the user block
- [X] T027 [US3] Write apps/admin/app/logged-out/page.test.tsx (heading "Du er logget ud", a link named "Log ind igen" pointing to `/`, no `navigation` landmark, `metadata.title` is "Logget ud"; US3-2/3), then create apps/admin/app/logged-out/page.tsx (outside the `(admin)` group, so no menu and no provider): `metadata.title = "Logget ud"`, a centered `.card` with heading "Du er logget ud" (`.text-display`) and `<Link href="/" className="button">Log ind igen</Link>`

**Checkpoint**: All three stories work; all tests pass

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, documentation sync, safety and the quality gate

- [X] T028 [P] Write apps/admin/components/side-menu/SideMenu.keyboard.test.tsx: rendering `SideMenu` with `activeHref="/"`, pressing Tab from the start reaches, in order, the brand pill, Organic Growth, GEOtracking, SimpleSERP, Indstillinger and the "Log ud" link, each an `<a>` with the right `href` (FR-014, SC-006)
- [X] T029 [P] Update specs/001-feedback-inbox/contracts/components.md and specs/001-feedback-inbox/data-model.md to point to the new state split: `Inbox` takes `tickets` and ticket callbacks, `InboxContainer` reads `TicketsProvider`, ticket rules live in `lib/tickets/state.ts` (link to specs/002-side-menu/data-model.md instead of duplicating it); also add a one-line "Superseded by spec 002 (shared ticket state)" note, with the same link, to specs/001-feedback-inbox/plan.md (Summary) and to R1 in specs/001-feedback-inbox/research.md (the page now lives in `app/(admin)/` and renders `InboxContainer`)
- [X] T030 [P] Audit apps/admin (excluding node_modules and .next): `grep -rn "mock-feedback\|mock-workspace"` matches only apps/admin/app/(admin)/layout.tsx; `grep -rn "useTickets"` matches only TicketsProvider, InboxContainer, SideMenuContainer and their tests; no `dangerouslySetInnerHTML`; fix anything found (Constitution V, III)
- [ ] T031 Compare the running app with specs/002-side-menu/design/side-menu.png and the three page screenshots, and a fresh Figma `get_screenshot` of node `323:2095`; fix differences via tokens in apps/admin/app/globals.css (SC-004). Allowed: Danish wording, lower counts, and the search bar, page headers and cards (separate features)
- [X] T032 Run the quality gate from `apps/admin`: `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`; the build must show `/`, `/platforms/geotracking`, `/platforms/simpleserp`, `/settings` and `/logged-out` as prerendered with no `blocking-prerender` errors
- [ ] T033 Walk through every section of specs/002-side-menu/quickstart.md, including the keyboard-only pass, and fix any failure

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: T002 first. T003, T004 in parallel after it. T005 → T006 → T007 →
  T008 (each builds on the previous state code). T009, T011 any time. T010 needs T007 and T008.
  Blocks all user stories.
- **US1 (Phase 3)**: needs Phase 2 and T001 (icons).
- **US2 (Phase 4)**: needs US1 (the settings item and highlighting extend `SideMenu` and its
  container). T020–T022 (pages) can start right after Phase 2.
- **US3 (Phase 5)**: needs US2's T023 (the user block sits below the settings item). T027 can start
  right after Phase 2.
- **Polish (Phase 6)**: needs all stories.

### Within Each User Story

- Pure functions and leaf components marked [P] first, then `SideMenu`, then the container and the
  layout wiring, then the integration test.
- Tasks that edit `SideMenu.tsx` / `SideMenu.test.tsx` (T016, T023, T026) are never parallel.

### Parallel Opportunities

- Phase 2: T003 and T004 (after T002); T009 and T011 alongside the state tasks
- US1: T012, T013, T014
- US2: T020, T021, T022 (pages, independent of the menu code)
- US3: T025 and T027
- Polish: T028, T029, T030

---

## Parallel Example: User Story 2

```bash
# The three page files share nothing:
Task: "Platform page in apps/admin/app/(admin)/platforms/[platform]/page.tsx"
Task: "Settings page in apps/admin/app/(admin)/settings/page.tsx"
Task: "Not-found pages in apps/admin/app/(admin)/not-found.tsx and apps/admin/app/not-found.tsx"
# Then, in order:
Task: "Settings item in SideMenu.tsx + test"
Task: "SideMenuContainer.test.tsx for highlighting per URL"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

Both are P1; together they make a useful menu.

1. Phase 1: icons
2. Phase 2: provider, inbox refactor, route group (**validate**: inbox unchanged, all green)
3. Phase 3: US1 → **validate**: menu with live counts on `/`
4. Phase 4: US2 → **validate**: every item navigates and highlights → demo-able MVP

### Incremental Delivery

1. Setup + Foundational → shared ticket state, nothing visible changes
2. + US1 → menu with counts
3. + US2 → navigation and empty pages (MVP)
4. + US3 → user block and log out
5. Polish → keyboard, docs sync, audit, visual check, quality gate

Commit after each task or checkpoint.

---

## Notes

- [P] tasks = different files, no dependencies on unfinished tasks
- Figma asset URLs expire after 7 days; T001 downloads them, code never references them
- The inbox's sub-components (`Toolbar`, `TicketList`, `TicketRow`, `TicketDetail`, …) must not
  change in this feature; only `Inbox.tsx`, its state and selectors, and the new container do
