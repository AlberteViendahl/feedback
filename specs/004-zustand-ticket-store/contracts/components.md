# Contracts: Shared Ticket Store

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

This document covers the module API, the component and page changes, and the test setup for this
feature. It replaces the "Ticket state" section and the `TicketsProvider` wrapper in
[spec 002's contract](../../002-side-menu/contracts/components.md).

The folder convention from spec 001 still applies:

- The main component sits at the root of its feature folder.
- Each sub-component has its own folder, named after it.
- There are no `index.ts` files.

## Ticket store (`lib/tickets/store.ts`, new)

```ts
import { create } from "zustand";

type TicketsState = { tickets: Feedback[] };

/** Hook: read with a selector, e.g. useTicketsStore((state) => state.tickets). */
export const useTicketsStore: UseBoundStore<StoreApi<TicketsState>>;
// initial state: { tickets: mockFeedback }

export function markRead(id: string): void;
export function sendReply(id: string, text: string, now: number): void;
export function createIssue(id: string): void;
/** Back to the tickets as at first load (FR-008). Also run after every test. */
export function resetTickets(): void;
```

Behaviour:

- `markRead`, `sendReply` and `createIssue` each run `ticketsReducer` from
  `lib/tickets/state.ts` with the matching `TicketAction`. The reducer is unchanged.
- `resetTickets` calls `useTicketsStore.setState(useTicketsStore.getInitialState(), true)`.
- The module has no `"use client"` directive and is imported only by client components.

Rules ([research R2](../research.md#r2-one-global-store-not-one-per-request),
[R3](../research.md#r3-store-shape-and-actions)):

- Server Components never import the store. Nothing writes to it during render.
- Selectors return a value already held in the state (`state.tickets`). They never return a
  newly built object or array.
- The store holds only data that is the same for every visitor (mock data). Per-user data needs
  a new decision (Convex).

## Containers (changed)

```tsx
// components/inbox/InboxContainer.tsx ("use client")
export function InboxContainer() {
  const tickets = useTicketsStore((state) => state.tickets);
  return (
    <Inbox tickets={tickets} onOpenTicket={markRead} onSendReply={sendReply} onCreateIssue={createIssue} />
  );
}

// components/side-menu/SideMenuContainer.tsx ("use client"): only MenuWithCounts changes
const tickets = useTicketsStore((state) => state.tickets);
```

The props of `InboxContainer` and `SideMenuContainer` are unchanged. `Inbox`, `SideMenu`,
`UserBlock`, `AppShell` and every other presentational component are unchanged (FR-007). In
`Inbox.tsx`, only the comment about where ticket changes live is updated.

## Reset on log-out (`components/ResetTickets/ResetTickets.tsx`, new)

```ts
"use client";
/** Clears the session's ticket changes whenever it is shown. Renders nothing. */
export function ResetTickets(): null;
// useEffect(() => resetTickets(), [])
```

React runs the effect when the component mounts, and again each time `<Activity>` shows it after
hiding it ([research R5](../research.md#r5-clearing-ticket-changes-on-log-out-fr-008)).

## Pages and layout (changed)

| File | Change |
|------|--------|
| `app/(admin)/layout.tsx` | Remove `<TicketsProvider>` and the `mockFeedback` import. `AppShell` becomes the root element. The comment about ticket changes points to the store |
| `app/(admin)/page.tsx` | Comment only: the data comes from the ticket store |
| `app/logged-out/page.tsx` | Render `<ResetTickets />` inside `<main>`. Replace the comment about the provider with the store reset. Still a Server Component, and its markup and text are unchanged |

## Removed

- `components/TicketsProvider/TicketsProvider.tsx`, including `TicketsProvider` and `useTickets`
- `components/TicketsProvider/TicketsProvider.test.tsx`

## Dependency

`apps/admin/package.json` gets `"zustand": "5.1.0"` under `dependencies`, pinned exactly like
`next` and `react`. Install it with `npm install zustand@5.1.0 --save-exact`, which also updates
the lockfile ([research R1](../research.md#r1-adding-zustand-constitution-principle-iv)).

## Test setup (changed)

```ts
// vitest.setup.ts
afterEach(() => {
  cleanup();
  resetTickets(); // the store outlives a render; start every test from the mock data
});
```

How a test gets its tickets:

```tsx
// before                                              // after
render(                                                useTicketsStore.setState({ tickets: fixtureTickets });
  <TicketsProvider initialTickets={fixtureTickets}>    render(<InboxContainer />);
    <InboxContainer />
  </TicketsProvider>,
);
```

| Test file | Change |
|-----------|--------|
| `lib/tickets/store.test.ts` | **New**: initial tickets are `mockFeedback`; each action changes `getState().tickets` by the reducer's rules; a disallowed action keeps the same array; `resetTickets` restores the initial tickets |
| `components/ResetTickets/ResetTickets.test.tsx` | **New**: renders nothing; clears changed tickets on mount; clears them again when shown after `<Activity mode="hidden">` |
| `app/logged-out/page.test.tsx` | **+1 test**: rendering the page clears changed tickets |
| `components/side-menu/SideMenu.integration.test.tsx` | Wrapper → `setState` in `beforeEach`; `app()` returns the menu and inbox only. **+1 test**: open a ticket, render `ResetTickets` (as the logged-out page does), and the counts and "Ny" badges are back (US3) |
| `components/inbox/Inbox.test.tsx` | `renderInbox` sets the tickets, then renders. The remount and `<Activity>` tests drop the provider |
| `components/inbox/Inbox.keyboard.test.tsx` | Two wrappers → `setState` |
| `components/side-menu/SideMenuContainer.test.tsx` | Wrapper → `setState` in `renderAt` |
| `components/TicketsProvider/TicketsProvider.test.tsx` | **Deleted** ([research R7](../research.md#r7-tests-that-change-or-go-away)) |

No assertion about what the admin sees is removed or loosened (FR-011, SC-001).
