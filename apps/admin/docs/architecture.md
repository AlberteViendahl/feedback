# Frontend architecture: apps/admin

An overview of the admin app as the code stands today: which pages exist, which components they
render, and where their data comes from. Everything here is read from the source; where the code
leaves something open, the text says so instead of filling the gap.

Each section comes in four levels. Level 1 is the quick overview and is always shown; Levels 2–4
are collapsed and add detail step by step, ending with the full diagram in Level 4.

Keep this file in step with the code (see `CLAUDE.md` → Conventions).

## Legend

The same colours are used in every diagram, at every level.

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

In the data-flow diagrams, solid arrows carry data down to where it is shown; dashed arrows carry
changes back up to the store.

## 1. Pages and routes

### Level 1

```mermaid
flowchart TD
  Base["Base frame"]:::layout
  Admin["Admin area with menu"]:::layout
  Inbox["Feedback inbox"]:::page
  Empty["Empty pages for later"]:::page
  Out["Logged-out page"]:::page
  Missing["Page not found"]:::page

  Base --> Admin
  Base --> Out
  Base --> Missing
  Admin --> Inbox
  Admin --> Empty
  Admin -. "unknown platform" .-> Missing

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

Every page sits in one base frame; the inbox and the empty pages also get the admin menu, while
the logged-out page does not. There is one page-not-found page: it shows the menu for an unknown
platform, and no menu for any other unknown address.

<details>
<summary>Level 2</summary>

```mermaid
flowchart TD
  Root["RootLayout"]:::layout
  Admin["AdminLayout<br/>(admin) group"]:::layout
  Home["Inbox<br/>/"]:::page
  Platform["Platform page<br/>/platforms/[platform]"]:::page
  Settings["Settings<br/>/settings"]:::page
  LoggedOut["Logged out<br/>/logged-out"]:::page
  NotFound["Not found<br/>menu only for an unknown platform"]:::page

  Root --> Admin
  Root --> LoggedOut
  Root --> NotFound
  Admin --> Home
  Admin --> Platform
  Admin --> Settings
  Platform -. "unknown platform" .-> NotFound

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 3</summary>

```mermaid
flowchart TD
  MockWorkspace[/"lib/mock-workspace.ts"/]:::mock
  MockFeedback[/"lib/mock-feedback.ts"/]:::mock
  Store[("useTicketsStore")]:::store

  Root["RootLayout"]:::layout
  Admin["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  SideMenu["SideMenu"]:::component

  Home["/"]:::page
  Inbox["Inbox"]:::component
  Platform["/platforms/[platform]"]:::page
  Settings["/settings"]:::page

  LoggedOut["/logged-out"]:::page
  ResetTickets["ResetTickets"]:::component
  NotFound["not-found"]:::page

  Root --> Admin
  Root --> LoggedOut
  Root --> NotFound
  MockWorkspace -- "mock: lib/mock-workspace.ts" --> Admin
  Admin -- "props: user, menu, children" --> AppShell
  Admin -- "props: workspace, user" --> SideMenu
  AppShell -- "children" --> Home
  AppShell -- "children" --> Platform
  AppShell -- "children" --> Settings
  Platform -. "notFound()" .-> NotFound
  AppShell -. "children, for notFound() in (admin)" .-> NotFound
  Home --> Inbox
  LoggedOut --> ResetTickets

  MockFeedback -- "mock: lib/mock-feedback.ts" --> Store
  Store -- "zustand: useTicketsStore" --> SideMenu
  Store -- "zustand: useTicketsStore" --> Inbox
  ResetTickets -. "zustand: useTicketsStore" .-> Store

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 4</summary>

```mermaid
flowchart TD
  Root["RootLayout<br/>app/layout.tsx"]:::layout

  Admin["AdminLayout<br/>app/(admin)/layout.tsx<br/>route group: adds no URL segment"]:::layout
  LoggedOut["/logged-out<br/>app/logged-out/page.tsx"]:::page
  NotFound["not-found<br/>app/not-found.tsx<br/>also the not-found boundary inside (admin)"]:::page

  Home["/<br/>app/(admin)/page.tsx"]:::page
  Platform["/platforms/[platform]<br/>app/(admin)/platforms/[platform]/page.tsx<br/>static params: geotracking, simpleserp"]:::page
  Settings["/settings<br/>app/(admin)/settings/page.tsx"]:::page

  Root --> Admin
  Root --> LoggedOut
  Root --> NotFound
  Admin --> Home
  Admin --> Platform
  Admin --> Settings
  Platform -. "notFound() for an unknown platform" .-> NotFound

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

The `(admin)` route group decides whether a page gets the side menu: everything inside it is
wrapped by `AdminLayout` (and so by `AppShell` and `SideMenu`), while `/logged-out` sits directly
under `RootLayout` with no menu. There is one not-found page, `app/not-found.tsx`, and where it
renders depends on how it is reached. For unmatched URLs (e.g. `/foo`) it renders under
`RootLayout` only, without the menu. Because `(admin)` is a route group directly under `app/`,
Next.js also puts it as the not-found boundary inside `AdminLayout`, so `notFound()` from
`/platforms/[platform]` (which builds only `geotracking` and `simpleserp`) renders it inside the
admin frame, with the menu. This comes from Next.js, not from our code: the server HTML for
`/platforms/foo` leaves the menu out, but the page the browser renders has it.
`/platforms/[platform]` and `/settings` are placeholders with a heading only.

</details>

## 2. Component tree

### Level 1

```mermaid
flowchart TD
  Frame["Admin frame"]:::layout
  Menu["Menu"]:::component
  TopBar["Top bar on small screens"]:::component
  Inbox["Feedback inbox"]:::page
  Parts["List of feedback and the open feedback"]:::component

  Frame --> TopBar
  Frame --> Menu
  Frame --> Inbox
  Inbox --> Parts

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

The admin frame puts a menu (and a top bar on small screens) around the page, and the inbox shows
a list of feedback next to the one that is open.

<details>
<summary>Level 2</summary>

```mermaid
flowchart TD
  AdminLayout["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  TopBar["TopBar"]:::component
  SideMenu["SideMenu"]:::component
  Home["Inbox page<br/>/"]:::page
  Inbox["Inbox"]:::component
  TicketList["TicketList"]:::component
  TicketDetail["TicketDetail"]:::component

  AdminLayout --> AppShell
  AppShell --> TopBar
  AppShell --> SideMenu
  AppShell --> Home
  Home --> Inbox
  Inbox --> TicketList
  Inbox --> TicketDetail

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 3</summary>

```mermaid
flowchart TD
  MockWorkspace[/"lib/mock-workspace.ts"/]:::mock
  MockFeedback[/"lib/mock-feedback.ts"/]:::mock
  Store[("useTicketsStore")]:::store

  AdminLayout["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  TopBar["TopBar"]:::component
  SideMenu["SideMenu"]:::component
  NavItem["NavItem"]:::component
  UserBlock["UserBlock"]:::component

  Home["/"]:::page
  Inbox["Inbox"]:::component
  SearchBar["SearchBar"]:::component
  Toolbar["Toolbar"]:::component
  TicketList["TicketList"]:::component
  TicketRow["TicketRow"]:::component
  TicketDetail["TicketDetail"]:::component
  Sections["AttachmentList, ContextTable,<br/>ReplySection, ReplyActions"]:::component

  MockWorkspace -- "mock: lib/mock-workspace.ts" --> AdminLayout
  AdminLayout -- "props: user, menu, children" --> AppShell
  AppShell -- "props: userName" --> TopBar
  AppShell -- "props: menu" --> SideMenu
  SideMenu -- "props: count, isActive" --> NavItem
  SideMenu -- "props: user, workspaceName" --> UserBlock
  AppShell -- "props: children" --> Home
  Home --> Inbox
  MockFeedback -- "mock: lib/mock-feedback.ts" --> Store
  Store -- "zustand: useTicketsStore" --> SideMenu
  Store -- "zustand: useTicketsStore" --> Inbox
  Inbox -- "props" --> SearchBar
  Inbox -- "props" --> Toolbar
  Inbox -- "props" --> TicketList
  TicketList -- "props" --> TicketRow
  Inbox -- "props" --> TicketDetail
  TicketDetail -- "props" --> Sections

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 4</summary>

Nesting is shown as parent → child. Icons are left out to keep the diagram readable. `Icon`
(`components/Icons/Icon.tsx`, an image from `public/icons`) is rendered by `AppShell`, `SideMenu`
(and its inner `PlatformIcon`), `UserBlock`, `UserAvatar`, `SearchBar`, `Toolbar`,
`AttachmentList`, `ContextTable` and `ReplyActions`. The inline SVG icons in `components/Icons`
take their size from the global `icon-size` class in `app/globals.css` and their dark colour from
the surrounding text (`currentColor`): `CategoryBadge` renders `BugIcon`, `LightbulbIcon` or
`MessageIcon` for the ticket's category, `TicketDetail` renders `BugIcon`, `TicketRow` renders
`PaperclipIcon` and `ReplyActions` renders `BranchIcon`; `ArrowLeftIcon` is not rendered yet.

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
    Inbox["Inbox"]:::component
    SearchBar["SearchBar"]:::component
    Toolbar["Toolbar"]:::component
    TicketList["TicketList"]:::component
    TicketRow["TicketRow ×n"]:::component
    CategoryBadge["CategoryBadge<br/>(in TicketRow.tsx)"]:::component
    StatusBadge["StatusBadge"]:::component
    TicketDetail["TicketDetail"]:::component
    AttachmentList["AttachmentList"]:::component
    ContextTable["ContextTable"]:::component
    ReplySection["ReplySection"]:::component
    ReplyActions["ReplyActions"]:::component

    Home --> Inbox
    Inbox --> SearchBar
    Inbox --> Toolbar
    Inbox --> TicketList --> TicketRow
    TicketRow --> CategoryBadge
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
  end

  subgraph NoMenu["Outside (admin): RootLayout only"]
    LoggedOut["/logged-out"]:::page
    ResetTickets["ResetTickets<br/>renders nothing"]:::component
    LoggedOut --> ResetTickets
  end

  NotFound["not-found<br/>with or without the menu"]:::page

  AppShell -- "children (main)" --> Home
  AppShell -- "children (main)" --> Placeholders
  AppShell -. "children (main), for notFound() in (admin)" .-> NotFound
  NoMenu ~~~ NotFound

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

`SideMenu` renders itself up to three times: `AdminLayout` wraps it in `<Suspense>` because
`usePathname` can suspend on unknown platform URLs, so the fallback is the same menu with nothing
highlighted, and the real one hands off to `SideMenuAtCurrentUrl`, which reads the URL and renders
`SideMenu` again with `activeHref` set. The inbox is the only page with real UI; `Inbox` reads and changes
tickets through the store and keeps its own view state, while its children get props only, and
both `ReplySection` and `ReplyActions` are exported from the same file,
`components/inbox/ReplySection/ReplySection.tsx`. The placeholder pages and the not-found page
render only HTML and `next/link`; the not-found page renders inside `AppShell` for an unknown
platform and under `RootLayout` alone for any other unknown URL (see section 1, Level 4).

</details>

## 3. Data flow

### Level 1

```mermaid
flowchart TD
  Sample[/"Sample data<br/>(stand-in for the database)"/]:::mock
  Frame["Admin frame"]:::layout
  Memory[("Shared feedback memory")]:::store
  Menu["Menu"]:::component
  Inbox["Inbox"]:::component

  Sample -- "workspace and user" --> Frame
  Sample -- "feedback" --> Memory
  Frame -- "workspace and user" --> Menu
  Memory -- "number of new feedback" --> Menu
  Memory -- "feedback" --> Inbox
  Inbox -. "read, replied, issue created" .-> Memory

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

All feedback lives in one shared memory filled from sample data, so when the inbox changes a
feedback, the menu's count of new feedback updates at once.

<details>
<summary>Level 2</summary>

```mermaid
flowchart TD
  MockWorkspace[/"mockWorkspace, mockUser"/]:::mock
  MockFeedback[/"mockFeedback"/]:::mock
  Store[("useTicketsStore")]:::store
  AdminLayout["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  SideMenu["SideMenu"]:::component
  Inbox["Inbox"]:::component
  ResetTickets["ResetTickets<br/>on log-out"]:::component

  MockWorkspace -- "mock" --> AdminLayout
  AdminLayout -- "props" --> AppShell
  AdminLayout -- "props" --> SideMenu
  MockFeedback -- "mock" --> Store
  Store -- "zustand" --> SideMenu
  Store -- "zustand" --> Inbox
  Inbox -. "zustand" .-> Store
  ResetTickets -. "zustand" .-> Store

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 3</summary>

```mermaid
flowchart TD
  MockWorkspace[/"lib/mock-workspace.ts"/]:::mock
  MockFeedback[/"lib/mock-feedback.ts"/]:::mock
  Store[("useTicketsStore")]:::store

  AdminLayout["AdminLayout"]:::layout
  AppShell["AppShell"]:::component
  TopBar["TopBar"]:::component
  SideMenu["SideMenu"]:::component

  Inbox["Inbox<br/>view state: useReducer"]:::component
  SearchBar["SearchBar"]:::component
  Toolbar["Toolbar"]:::component
  TicketList["TicketList"]:::component
  TicketDetail["TicketDetail"]:::component
  ResetTickets["ResetTickets"]:::component

  MockWorkspace -- "mock: lib/mock-workspace.ts" --> AdminLayout
  AdminLayout -- "props: user" --> AppShell
  AppShell -- "props: userName" --> TopBar
  AdminLayout -- "props: workspace, user" --> SideMenu
  MockFeedback -- "mock: lib/mock-feedback.ts" --> Store
  Store -- "zustand: useTicketsStore" --> SideMenu
  Store -- "zustand: useTicketsStore" --> Inbox
  Inbox -- "props: search" --> SearchBar
  Inbox -- "props: filters, counts" --> Toolbar
  Inbox -- "props: visible tickets" --> TicketList
  Inbox -- "props: selected ticket" --> TicketDetail
  Inbox -. "zustand: useTicketsStore" .-> Store
  ResetTickets -. "zustand: useTicketsStore" .-> Store

  classDef page fill:#DBEAFE,stroke:#1D4ED8,color:#1E3A8A
  classDef layout fill:#EDE9FE,stroke:#6D28D9,color:#4C1D95
  classDef component fill:#DCFCE7,stroke:#15803D,color:#14532D
  classDef store fill:#FFEDD5,stroke:#C2410C,color:#7C2D12
  classDef mock fill:#F3F4F6,stroke:#4B5563,color:#1F2937,stroke-dasharray:4 3
```

</details>

<details>
<summary>Level 4</summary>

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

  Store -- "zustand: useTicketsStore<br/>tickets" --> Inbox
  Inbox -- "props: search" --> SearchBar
  Inbox -- "props: filters, sortOrder, counts" --> Toolbar
  Inbox -- "props: visible tickets, selectedId, now" --> TicketList
  TicketList -- "props: ticket, isSelected, now" --> TicketRow
  Inbox -- "props: selected ticket, replyDraft, notice" --> TicketDetail
  TicketDetail -- "props: ticket fields" --> Sections

  Inbox -. "zustand: useTicketsStore<br/>markRead, sendReply, createIssue" .-> Store
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
`ticketsReducer` in `lib/tickets/state.ts`; `Inbox` calls them directly, and its children only
get callbacks from `Inbox`. Search, filters, sort order, the open ticket, the
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

</details>
