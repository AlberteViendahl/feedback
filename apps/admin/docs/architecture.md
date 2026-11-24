# Frontend architecture: apps/admin

An overview of the admin app as the code stands today: which pages exist, which components they
render, and where their data comes from. Everything here is read from the source; where the code
leaves something open, the text says so instead of filling the gap.

Keep this file in step with the code (see `CLAUDE.md` → Conventions).

## Legend

The same colours are used in all three diagrams.

| Category      | Colour            | What it is                                                         |
| ------------- | ----------------- | ------------------------------------------------------------------ |
| Page          | blue              | A `page.tsx` or `not-found.tsx` in `app/`                          |
| Layout        | purple            | A `layout.tsx` in `app/`                                           |
| Component     | green             | A React component in `components/` (or `next/react` built-in)      |
| Zustand store | orange            | A Zustand store in `lib/`                                          |
| Mock data     | grey, dashed edge | A mock-data module in `lib/` that stands in for the Convex backend |

```mermaid
flowchart LR
  P[Page]:::page
  L[Layout]:::layout
  C[Component]:::component
  S[(Zustand store)]:::store
  M[/Mock data/]:::mock

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

In the data-flow diagram, solid arrows carry data down to where it is shown; dashed arrows carry
changes back up to the store.

## 1. Pages and routes

```mermaid
flowchart TD
  Root["RootLayout<br/>app/layout.tsx"]:::layout

  Admin["AdminLayout<br/>app/(admin)/layout.tsx<br/>route group: adds no URL segment"]:::layout
  LoggedOut["/logged-out<br/>app/logged-out/page.tsx"]:::page
  RootNotFound["not-found (root)<br/>app/not-found.tsx"]:::page

  Home["/<br/>app/(admin)/page.tsx"]:::page
  Platform["/platforms/[platform]<br/>app/(admin)/platforms/[platform]/page.tsx<br/>static params: geotracking, simpleserp"]:::page
  Settings["/settings<br/>app/(admin)/settings/page.tsx"]:::page
  AdminNotFound["not-found (admin)<br/>app/(admin)/not-found.tsx"]:::page

  Root --> Admin
  Root --> LoggedOut
  Root --> RootNotFound
  Admin --> Home
  Admin --> Platform
  Admin --> Settings
  Admin --> AdminNotFound
  Platform -. "notFound() for an unknown platform" .-> AdminNotFound

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

The `(admin)` route group decides whether a page gets the side menu: everything inside it is
wrapped by `AdminLayout` (and so by `AppShell` and `SideMenu`), while `/logged-out` and the root
not-found page sit directly under `RootLayout` with no menu. `/platforms/[platform]` builds only
`geotracking` and `simpleserp` and calls `notFound()` for anything else, which renders the admin
not-found page inside the menu; `/platforms/[platform]` and `/settings` are placeholders with a
heading only. Which not-found page an unmatched URL outside `/platforms/…` (e.g. `/foo`) gets is
left to Next.js routing: the code comments say the root one, but no test in this app checks it.

## 2. Component tree

Nesting is shown as parent → child. `Icon` (`components/Icons/Icon.tsx`) is left out to keep the
diagram readable; it is rendered by `AppShell`, `SideMenu` (and its inner `PlatformIcon`),
`UserBlock`, `UserAvatar`, `CategoryIcon`, `SearchBar`, `Toolbar`, `TicketRow`, `TicketDetail`,
`AttachmentList`, `ContextTable` and `ReplyActions`.

```mermaid
flowchart TD
  subgraph AdminFrame["Admin frame: every page in (admin)"]
    AdminLayout["AdminLayout"]:::layout
    AppShell["AppShell"]:::component
    TopBar["TopBar"]:::component
    TopAvatar["UserAvatar"]:::component
    Suspense["Suspense<br/>(React)"]:::component
    FallbackMenu["SideMenu<br/>fallback, activeHref = null"]:::component
    SideMenu["SideMenu<br/>activeHref omitted"]:::component
    AtUrl["SideMenuAtCurrentUrl<br/>(in SideMenu.tsx)"]:::component
    UrlMenu["SideMenu<br/>activeHref from URL"]:::component
    NavItem["NavItem ×n<br/>workspace, platforms, settings"]:::component
    PlatformIcon["PlatformIcon<br/>(in SideMenu.tsx)"]:::component
    UserBlock["UserBlock"]:::component
    MenuAvatar["UserAvatar"]:::component

    AdminLayout --> AppShell
    AppShell --> TopBar --> TopAvatar
    AppShell -- "menu slot" --> Suspense
    Suspense -- fallback --> FallbackMenu
    Suspense --> SideMenu --> AtUrl --> UrlMenu
    UrlMenu --> NavItem
    UrlMenu --> PlatformIcon
    UrlMenu --> UserBlock --> MenuAvatar
    FallbackMenu -. "same children" .-> NavItem
  end

  subgraph HomePage["/"]
    Home["Home<br/>app/(admin)/page.tsx"]:::page
    InboxContainer["InboxContainer"]:::component
    Inbox["Inbox"]:::component
    SearchBar["SearchBar"]:::component
    Toolbar["Toolbar"]:::component
    TicketList["TicketList"]:::component
    TicketRow["TicketRow ×n"]:::component
    CategoryIcon["CategoryIcon"]:::component
    StatusBadge["StatusBadge"]:::component
    TicketDetail["TicketDetail"]:::component
    AttachmentList["AttachmentList"]:::component
    ContextTable["ContextTable"]:::component
    ReplySection["ReplySection"]:::component
    ReplyActions["ReplyActions"]:::component

    Home --> InboxContainer --> Inbox
    Inbox --> SearchBar
    Inbox --> Toolbar
    Inbox --> TicketList --> TicketRow
    TicketRow --> CategoryIcon
    TicketRow --> StatusBadge
    Inbox --> TicketDetail
    TicketDetail --> AttachmentList
    TicketDetail --> ContextTable
    TicketDetail --> ReplySection
    TicketDetail --> ReplyActions
  end

  subgraph Placeholders["Pages with no components of their own"]
    Platform["/platforms/[platform]"]:::page
    Settings["/settings"]:::page
    AdminNotFound["not-found (admin)"]:::page
  end

  subgraph NoMenu["Outside (admin): RootLayout only"]
    LoggedOut["/logged-out"]:::page
    ResetTickets["ResetTickets<br/>renders nothing"]:::component
    RootNotFound["not-found (root)"]:::page
    LoggedOut --> ResetTickets
  end

  AppShell -- "children (main)" --> Home
  AppShell -- "children (main)" --> Placeholders

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

`SideMenu` renders itself up to three times: `AdminLayout` wraps it in `<Suspense>` because
`usePathname` can suspend on unknown platform URLs, so the fallback is the same menu with nothing
highlighted, and the real one hands off to `SideMenuAtCurrentUrl`, which reads the URL and renders
`SideMenu` again with `activeHref` set. The inbox is the only page with real UI; it is split into
`InboxContainer` (connects to the store) and `Inbox` (props only, plus its own view state), and
both `ReplySection` and `ReplyActions` are exported from the same file,
`components/inbox/ReplySection/ReplySection.tsx`. The placeholder pages and both not-found pages
render only HTML and `next/link`.

## 3. Data flow

```mermaid
flowchart TD
  MockWorkspace[/"lib/mock-workspace.ts<br/>mockWorkspace, mockUser"/]:::mock
  MockFeedback[/"lib/mock-feedback.ts<br/>mockFeedback"/]:::mock
  Store[("useTicketsStore<br/>lib/tickets/store.ts<br/>{ tickets }")]:::store

  AdminLayout["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  TopBar["TopBar"]:::component
  SideMenu["SideMenu"]:::component
  NavItem["NavItem"]:::component
  UserBlock["UserBlock"]:::component

  InboxContainer["InboxContainer"]:::component
  Inbox["Inbox<br/>view state: useReducer"]:::component
  SearchBar["SearchBar"]:::component
  Toolbar["Toolbar"]:::component
  TicketList["TicketList"]:::component
  TicketRow["TicketRow"]:::component
  TicketDetail["TicketDetail"]:::component
  Sections["AttachmentList, ContextTable,<br/>ReplySection, ReplyActions"]:::component

  ResetTickets["ResetTickets<br/>on /logged-out"]:::component

  MockWorkspace -- "mock: lib/mock-workspace.ts" --> AdminLayout
  MockFeedback -- "mock: lib/mock-feedback.ts<br/>initial state" --> Store

  AdminLayout -- "props: user" --> AppShell
  AppShell -- "props: userName" --> TopBar
  AdminLayout -- "props: workspace, user" --> SideMenu
  Store -- "zustand: useTicketsStore<br/>tickets → getNewCounts" --> SideMenu
  SideMenu -- "props: href, label, count, isActive" --> NavItem
  SideMenu -- "props: user, workspaceName" --> UserBlock

  Store -- "zustand: useTicketsStore<br/>tickets" --> InboxContainer
  InboxContainer -- "props: tickets + callbacks" --> Inbox
  Inbox -- "props: search" --> SearchBar
  Inbox -- "props: filters, sortOrder, counts" --> Toolbar
  Inbox -- "props: visible tickets, selectedId, now" --> TicketList
  TicketList -- "props: ticket, isSelected, now" --> TicketRow
  Inbox -- "props: selected ticket, replyDraft, notice" --> TicketDetail
  TicketDetail -- "props: ticket fields" --> Sections

  Inbox -. "props: onOpenTicket, onSendReply, onCreateIssue" .-> InboxContainer
  InboxContainer -. "zustand: useTicketsStore<br/>markRead, sendReply, createIssue" .-> Store
  ResetTickets -. "zustand: useTicketsStore<br/>resetTickets" .-> Store

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

There are two data sources: `AdminLayout` is the only reader of the workspace and user mock and
passes them down as props, while ticket data lives in one Zustand store, `useTicketsStore`, which
is seeded from `mockFeedback` and read by both the side menu (unread counts) and the inbox, so
opening a ticket updates the menu count at once. All ticket changes go through the store's action
functions (`markRead`, `sendReply`, `createIssue`, `resetTickets`), which run the pure
`ticketsReducer` in `lib/tickets/state.ts`; `Inbox` never touches the store itself but gets those
functions as callbacks from `InboxContainer`. Search, filters, sort order, the open ticket, the
reply draft and the notice are local `useReducer` state in `Inbox` (`lib/inbox/state.ts`), flow
down as props, and reset when the page is hidden; the highlighted menu item comes from the URL
(`usePathname`), not from any store.

Unclear in the code:

- `lib/mock-feedback.ts` says "Only app/page.tsx may import this (Constitution V)", but no
  `app/page.tsx` exists (the inbox is `app/(admin)/page.tsx`), and the actual importer is
  `lib/tickets/store.ts`. The comment looks stale; whether the store is the intended exception is
  not stated.
- The store has no persistence middleware, so a full page reload also brings back the mock data;
  the code only documents the explicit reset on `/logged-out`. Whether reload-resets are intended
  is not written down.
- The side menu shows unread counts per platform, but `/platforms/[platform]` does not read the
  store or filter tickets yet; it is a placeholder.
