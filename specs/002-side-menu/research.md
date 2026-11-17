# Research: Side Menu

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-17

Checked against the installed Next.js 16.4.6 docs in `apps/admin/node_modules/next/dist/docs/`
(`apps/admin/AGENTS.md`), with `cacheComponents` and `partialPrefetching` enabled in
`next.config.ts`. Decisions from the inbox feature (`specs/001-feedback-inbox/research.md`: Danish
dates, Figma icons via `next/image`, Vitest setup, tokens in `globals.css`) still apply.

## R1. Sharing ticket state between the menu and the inbox

- **Decision**: Move the ticket data out of the inbox into a `TicketsProvider` (React context +
  `useReducer`, `"use client"`) placed in a new `app/(admin)/layout.tsx`. The provider owns only
  the tickets and the actions that change them (`markRead`, `sendReply`, `createIssue`). The inbox
  keeps its *view* state (filters, sort, open ticket, reply draft, notice) in its own component,
  so that state resets when the admin navigates away and back (spec FR-017, Clarifications Q1).
- **Rationale**: The bundled docs (`01-getting-started/03-layouts-and-pages.md`) state that
  "on navigation, layouts preserve state, remain interactive, and do not rerender", so state held
  by a provider in a shared layout survives moving between `/`, `/platforms/*` and `/settings`,
  while the page component (the inbox) remounts. Splitting data from view state gives exactly
  the behavior chosen in clarification, and makes the provider the single place to swap for
  Convex queries and mutations later.
- **Alternatives considered**: Keep everything in the inbox and recompute counts from the mock
  data (counts would not update live, rejected by Q1 in specify); put view state in the provider
  too (rejected by clarification Q1); a state library such as Zustand (new dependency for
  something React context covers, Constitution IV); `sessionStorage` (survives reloads, which the
  spec says must restore mock data).

## R2. Keeping components prop-driven with a provider (Constitution V)

- **Decision**: Components that render UI keep taking data via props. Two thin client
  "container" components read the provider and pass props down: `InboxContainer` (renders
  `Inbox`) and `SideMenuContainer` (renders `SideMenu`). Only `app/(admin)/layout.tsx` imports
  mock data and hands it to `TicketsProvider` and the menu.
- **Rationale**: Constitution V: "Data loading belongs in pages/containers" and replacing mock
  data with Convex must not require changing presentational components. The containers are the
  only code that changes when Convex arrives (`useQuery`/`useMutation` instead of `useTickets`).
- **Alternatives considered**: Calling `useTickets()` inside `Inbox` and `SideMenu` directly
  (couples them to the provider and forces provider wrappers in every component test).

## R3. Routes, route group and layout

- **Decision**: Use a route group `app/(admin)/` whose layout renders the app shell (side menu +
  content) inside `TicketsProvider`. Pages: `app/(admin)/page.tsx` (`/`, the inbox, moved from
  `app/page.tsx`), `app/(admin)/platforms/[platform]/page.tsx`, `app/(admin)/settings/page.tsx`.
  The log-out page `app/logged-out/page.tsx` sits outside the group, so it has no menu (FR-013)
  and leaving the group unmounts the provider, which "logs out" by discarding the session's
  ticket changes. English URLs per clarification Q3.
- **Rationale**: Route groups opt routes into a shared layout without changing URLs (bundled docs,
  `route-groups.md`). The root `app/layout.tsx` stays the only root layout, so there are no full
  page reloads between groups (the caveat only applies to multiple root layouts).
- **Alternatives considered**: Rendering the menu in the root layout and hiding it on
  `/logged-out` with a pathname check (mixes concerns, needs client code in the root layout).

## R4. Platform pages with Cache Components

- **Decision**: `app/(admin)/platforms/[platform]/page.tsx` exports `generateStaticParams`
  returning the workspace's platforms (`geotracking`, `simpleserp`) and calls `notFound()` when
  `params.platform` is not one of them. An `app/(admin)/not-found.tsx` renders the "page not
  found" message inside the admin layout, so the menu stays visible (spec edge case). A root
  `app/not-found.tsx` gives unmatched URLs outside the admin area a Danish message too.
- **Rationale**: Bundled docs (`dynamic-routes.md`, "With Cache Components"): with
  `generateStaticParams` the known params are prerendered and validated at build time.
  `dynamicParams = false` is **not available** with Cache Components (`dynamicParams.md`), so
  unknown values reach the page at request time and must be rejected with `notFound()`.
  `not-found.js` renders for `notFound()` thrown in its segment's subtree, inside the layouts
  above it (`not-found.md`).
- **Alternatives considered**: A static page per platform (`platforms/geotracking/page.tsx`,
  …) – simpler routing but duplicates code per platform and does not scale with more platforms.

## R5. Highlighting the current page in the menu

- **Decision**: `SideMenuContainer` reads the URL with `usePathname()` and maps it to the active
  item with a pure function `getActiveHref(pathname, hrefs)` (exact match on `/`,
  `/platforms/<id>`, `/settings`; anything else → `null`). In the layout, the container is wrapped
  in `<Suspense>` whose fallback is the same menu with no item highlighted.
- **Rationale**: Bundled docs (`use-pathname.md`, "Cache Components"): `usePathname` resolves
  during prerendering for static routes and routes covered by `generateStaticParams`, but
  *suspends* for dynamic params not covered, and "a sidebar with active links rendered in a
  layout suspends on any page below it that has an unknown dynamic param … otherwise, the build
  fails". Since `dynamicParams = false` is unavailable (R4), `/platforms/<unknown>` is such a
  page, so the Suspense boundary is required. All real pages resolve at prerender time and never
  show the fallback.
- **Alternatives considered**: `useSelectedLayoutSegments` (same suspension rules, harder to map);
  each page rendering its own menu with an `active` prop (menu would remount on every navigation
  and duplicate layout code).

## R6. Links and log out

- **Decision**: Menu items, the brand pill, the log-out icon and "Log ind igen" are `next/link`
  `<Link>` elements. The log-out link points to `/logged-out` and carries `aria-label="Log ud"`.
  The current item gets `aria-current="page"` and `.nav-item--active`.
- **Rationale**: Links give Tab/Enter behavior, middle-click and bookmarks for free (FR-011,
  FR-014). Log-out is simulated (spec FR-013), so navigating away from the `(admin)` group is the
  entire action; no client logic or confirmation is needed.
- **Alternatives considered**: A `<button>` calling `router.push` (more code, loses link
  semantics, no benefit while there is no real session).

## R7. Counting new feedback

- **Decision**: A pure function `getNewCounts(tickets)` returns
  `{ total, byPlatform: Record<Platform, number> }` counting tickets with `isRead === false`.
  `SideMenuContainer` calls it on the provider's tickets on every render; zero counts are hidden
  by the `NavItem` component.
- **Rationale**: Deriving the counts from the same tickets the inbox renders guarantees they agree
  (spec FR-006, SC-003) and update in the same render as the inbox (SC-007). With 16 mock
  tickets the cost is negligible.

## R8. Shared platform labels and mock workspace

- **Decision**: Move `PLATFORM_LABELS` from `lib/inbox/format.ts` to a new shared
  `lib/platforms.ts` (with `PLATFORMS`, the list of known platform ids, and `isPlatform()`), used
  by the inbox, the menu and the platform page. Add `Workspace` and `AdminUser` types to
  `lib/types.ts` and a `lib/mock-workspace.ts` with "Organic Growth", its two platforms and the
  user "Hussein" (role "Admin").
- **Rationale**: The menu should not import from the inbox's private `lib/inbox/` folder;
  Constitution II keeps all shared types in `lib/types.ts`.

## R9. Visual design and assets

- **Decision**: Reuse the existing classes `.sidebar`, `.brand-pill`, `.nav-item`,
  `.nav-item--active`, `.text-overline`, `.avatar`, `.divider`. Measure the remaining spacing
  from Figma node `323:2095` during implementation and add it as tokens/classes in
  `globals.css` (Constitution I), plus shell classes for the sticky full-height menu (FR-001).
  Download the menu icons (settings gear, log-out, the platform circles with their globe and
  search glyphs, the workspace and user avatar circles) from Figma into `public/icons/` and add
  them to `components/Icons/Icon.tsx`. The empty pages, the not-found pages and the "Du er logget
  ud" page have no Figma design; they use only existing classes (`.text-display`,
  `.text-subtitle`, `.card`, `.button`).
- **Rationale**: Same approach as the inbox (spec 001 research R6/R7); no invented values.

## R10. Danish copy and page titles

| Where | Text |
|-------|------|
| Brand pill | Feedback · Admin |
| Platform heading | Platforme |
| Counts | `1 ny`, otherwise `{n} nye` (hidden when 0) |
| Settings item / page heading | Indstillinger |
| User block | `{name}`, `{role} · {workspace}` |
| Log-out icon label | Log ud |
| Platform page | heading `{platform}`, text "Denne side er tom indtil videre." |
| Settings page | heading "Indstillinger", same text |
| Not-found page | heading "Siden findes ikke", link "Gå til indbakken" |
| Logged-out page | heading "Du er logget ud", button "Log ind igen" |
| Browser tab titles | `Feedback · Admin` (default), `%s · Feedback · Admin` for other pages, e.g. "Indstillinger · Feedback · Admin" |

Titles use the Metadata API's `title.template` in the root layout and `metadata` /
`generateMetadata` per page.

## R11. Testing

- **Decision**: Unit-test the pure functions (`ticketsReducer`, inbox view reducer,
  `getNewCounts`, `getActiveHref`, `isPlatform`). Component-test `SideMenu`, `NavItem` and
  `UserBlock` with props. Test `SideMenuContainer` and `InboxContainer` together inside
  `TicketsProvider` (with `next/navigation`'s `usePathname` mocked via `vi.mock`) to prove live
  counts (US1-5), ticket changes surviving a remount of the inbox and the view resetting
  (US1-6/7). Pages, the admin layout and the not-found files also get tests (analysis C1/C2):
  synchronous ones are rendered directly; the async platform page is called as a function
  (`await Page({ params })`) and its result rendered, and `notFound()` is asserted as a rejected
  promise. `npm run build` and the quickstart still cover what jsdom cannot (layout, stickiness).
  Rendering async Server Components through React itself is not supported by Vitest (bundled
  Vitest guide), hence calling the platform page as a function.
