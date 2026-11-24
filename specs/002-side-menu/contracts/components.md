# UI Contracts: Side Menu

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

Component props, routes and pure-function signatures for this feature, plus the changes it makes
to the inbox's contract from spec 001
([../../001-feedback-inbox/contracts/components.md](../../001-feedback-inbox/contracts/components.md)).
Folder convention (from spec 001): the main component sits at the root of its feature folder,
each sub-component in its own folder named after it, no `index.ts` files.

> **Changed 2026-11-23:** `SideMenuContainer` was merged into `SideMenu`. `SideMenu` now takes
> `workspace`, `user` and an optional `activeHref` (same meaning as `SideMenuContainerProps`
> below), reads the counts from the ticket store itself, and keeps `usePathname` in a private
> inner component. The layout's `<Suspense>` setup is unchanged. Below, read `SideMenuContainer`
> as `SideMenu`.

> **Changed 2026-11-24:** `app/(admin)/not-found.tsx` was removed; `app/not-found.tsx` is the only
> not-found page. Next.js also uses it as the not-found boundary inside the top-level `(admin)`
> route group, so `/platforms/<unknown>` still shows it with the menu. Below, read the
> `/platforms/<unknown>` row as `app/not-found.tsx`, menu yes.

## Routes

| URL | File | Menu | Highlighted item |
|-----|------|------|------------------|
| `/` | `app/(admin)/page.tsx` | yes | Organic Growth |
| `/platforms/geotracking`, `/platforms/simpleserp` | `app/(admin)/platforms/[platform]/page.tsx` (`generateStaticParams`; unknown → `notFound()`) | yes | that platform |
| `/settings` | `app/(admin)/settings/page.tsx` | yes | Indstillinger |
| `/platforms/<unknown>` | `app/(admin)/not-found.tsx` | yes | none |
| `/logged-out` | `app/logged-out/page.tsx` | **no** | – |
| any other unknown URL | `app/not-found.tsx` | no | – |

`app/(admin)/layout.tsx` (Server Component) is the only file in this feature that imports mock
data:

```tsx
<TicketsProvider initialTickets={mockFeedback}>
  <div className="app-shell">
    <Suspense fallback={<SideMenuContainer workspace={mockWorkspace} user={mockUser} activeHref={null} />}>
      <SideMenuContainer workspace={mockWorkspace} user={mockUser} />   {/* reads usePathname */}
    </Suspense>
    <main className="app-shell__content">{children}</main>
  </div>
</TicketsProvider>
```

> **Changed by spec 004 (2026-11-22):** the layout has no `TicketsProvider` and no longer imports
> `mockFeedback`. The mock tickets enter in `lib/tickets/store.ts`. See
> [spec 004's contract](../../004-zustand-ticket-store/contracts/components.md#pages-and-layout-changed).

## Ticket state (`components/TicketsProvider/TicketsProvider.tsx`, `"use client"`)

```ts
type TicketsProviderProps = { initialTickets: Feedback[]; children: ReactNode }
function TicketsProvider(props: TicketsProviderProps): JSX.Element
function useTickets(): { tickets: Feedback[]; dispatch: (action: TicketAction) => void }
// throws a clear error when used outside TicketsProvider
```

> **Removed by spec 004 (2026-11-22):** replaced by the Zustand store `lib/tickets/store.ts`
> (`useTicketsStore`, `markRead`, `sendReply`, `createIssue`, `resetTickets`). See
> [spec 004's contract](../../004-zustand-ticket-store/contracts/components.md#ticket-store-libticketsstorets-new).

## Side menu (`components/side-menu/`)

```ts
// SideMenuContainer.tsx — "use client"; the only side-menu file that reads the provider/URL
type SideMenuContainerProps = {
  workspace: Workspace
  user: AdminUser
  /** Pass null to skip reading the URL (Suspense fallback). Omit to use usePathname(). */
  activeHref?: string | null
}

// SideMenu.tsx — presentational
type SideMenuProps = {
  workspace: Workspace
  user: AdminUser
  counts: NewCounts
  activeHref: string | null
}

// NavItem/NavItem.tsx — one menu row (<Link>)
type NavItemProps = {
  href: string
  label: string
  icon: ReactNode            // workspace circle, platform circle, or settings gear
  count?: number             // hidden when undefined or 0; "1 ny", otherwise "{n} nye"
  isActive: boolean          // → .nav-item--active + aria-current="page"
}

// UserBlock/UserBlock.tsx — avatar, name, "{role} · {workspaceName}", log-out link
type UserBlockProps = {
  user: AdminUser
  workspaceName: string
}
```

Rendering rules:

- Every item is a `next/link` `<Link>`; the log-out link goes to `/logged-out` with
  `aria-label="Log ud"`. The brand pill links to `/`.
- Long names are cut with `.truncate-line`; counts and the log-out icon never shrink.
- Only classes and tokens from `app/globals.css` are used (Constitution I).

## Inbox changes (spec 001 contract → this feature)

```ts
// components/inbox/InboxContainer.tsx — NEW, "use client"; reads useTickets(), renders Inbox
function InboxContainer(): JSX.Element

// components/inbox/Inbox.tsx — CHANGED: tickets and ticket actions come in as props;
// view state (filters, selection, draft, notice) stays inside and resets on remount.
type InboxProps = {
  tickets: Feedback[]
  onOpenTicket: (id: string) => void
  onSendReply: (id: string, text: string, now: number) => void
  onCreateIssue: (id: string) => void
}
```

Sub-components of the inbox (`Toolbar`, `TicketList`, `TicketRow`, `TicketDetail`, …) do not
change.

> **Changed by spec 004 (2026-11-22):** `InboxContainer` and `SideMenuContainer` read the
> ticket store instead of `useTickets()`. `InboxProps` is unchanged. See
> [spec 004's contract](../../004-zustand-ticket-store/contracts/components.md#containers-changed).

## Pure functions

```ts
// lib/tickets/state.ts  (moved from lib/inbox/state.ts: ticket part)
type TicketAction =
  | { type: "markRead"; id: string }
  | { type: "sendReply"; id: string; text: string; now: number }
  | { type: "createIssue"; id: string }
function ticketsReducer(tickets: Feedback[], action: TicketAction): Feedback[]

// lib/tickets/counts.ts
type NewCounts = { total: number; byPlatform: Record<Platform, number> }
function getNewCounts(tickets: Feedback[]): NewCounts
function formatNewCount(count: number): string | null   // null for 0, "1 ny", "{n} nye"

// lib/inbox/state.ts  (reduced to view state)
type InboxView = { statusFilter; categoryFilter; sortOrder; selectedId; replyDraft; notice }
type InboxViewAction =
  | { type: "select"; id: string }
  | { type: "setStatusFilter" | "setCategoryFilter" | "setSortOrder"; value: … }
  | { type: "editReply"; text: string }
  | { type: "showNotice"; notice: "reply-sent" | "issue-created" }
function createInitialView(): InboxView
function inboxViewReducer(view: InboxView, action: InboxViewAction): InboxView

// lib/inbox/select.ts  (now take tickets and view separately)
function getVisibleTickets(tickets: Feedback[], view: InboxView): Feedback[]
function getSelectedTicket(tickets: Feedback[], view: InboxView): Feedback | null
function getCounts(tickets: Feedback[], category: CategoryFilter): { all: number; done: number }  // unchanged here
// Spec 003 adds InboxView.search and changes getCounts to (tickets, { categoryFilter, search }):
// see ../../003-search-top-bar/contracts/components.md

// lib/platforms.ts
const PLATFORMS: readonly Platform[]
const PLATFORM_LABELS: Record<Platform, string>   // moved from lib/inbox/format.ts
function isPlatform(value: string): value is Platform

// lib/side-menu/active-href.ts
const SETTINGS_HREF = "/settings"
function platformHref(platform: Platform): string          // "/platforms/geotracking"
function getMenuHrefs(platforms: Platform[]): string[]     // ["/", ...platform hrefs, "/settings"]
function getActiveHref(pathname: string, hrefs: string[]): string | null
```
