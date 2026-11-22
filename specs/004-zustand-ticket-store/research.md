# Research: Shared Ticket Store

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-22

Checked against:

- the installed Next.js 16.4.6 docs in `apps/admin/node_modules/next/dist/docs/`, mainly
  `01-app/02-guides/preserving-ui-state.md`
- the Zustand 5.1.0 package (types and source) and its guides at tag `v5.1.0`:
  `docs/learn/guides/nextjs.md`, `testing.md` and `practice-with-no-store-actions.md`

These decisions from earlier specs still apply:

- The ticket rules live in the pure reducer `ticketsReducer` in `lib/tickets/state.ts`
  (spec 002, data-model.md).
- Presentational components get their data through props from thin containers (spec 002, R2).
- The inbox view lives in `Inbox` and resets when Next.js hides the page (spec 003, R9).

## R1. Adding Zustand (Constitution Principle IV)

- **Decision**: Add `zustand` 5.1.0 as a runtime dependency of `apps/admin`, pinned exactly like
  `next`, `react` and `react-dom`. Use it for the shared ticket data only.
- **Rationale**:
  - **Why**: the spec requires ticket data without a supplying wrapper, in the app (FR-006) and
    in tests (FR-010, SC-004). A Zustand store is a module that any client component can read,
    with no provider around the tree.
  - **Why existing tools are not enough**:
    - React Context needs a provider around every consumer, which is exactly what the spec
      removes.
    - Context can only be reached from inside its provider. The logged-out page lives outside
      the `(admin)` group, so it cannot clear the tickets (FR-008). That would need either the
      provider moved to the root layout, which wraps every page including `/logged-out` and the
      not-found pages, or a log-out callback passed down through `SideMenu` and `UserBlock`
      (see R5).
  - **Size and risk**:
    - The core is 636 bytes gzipped (`esm/vanilla.mjs` and `esm/react.mjs`, measured), with no
      runtime dependencies and an MIT licence.
    - Its React binding calls React's built-in `useSyncExternalStore`, so it works with React
      19.3 without the optional `use-sync-external-store` shim (peer: `react >=18`).
  - This reverses [spec 002, R1](../002-side-menu/research.md#r1-sharing-ticket-state-between-the-menu-and-the-inbox),
    which rejected Zustand as "a new dependency for something React context covers". Readable
    code without wrappers is now a stated requirement (spec 004, User Story 2), so the trade-off
    has changed.
- **Alternatives considered**:
  - Keep React Context. Rejected: fails FR-006, FR-010 and SC-004.
  - A hand-written module store on React's `useSyncExternalStore`, about 25 lines of
    subscribe/notify code with no dependency (`lib/inbox/use-now.ts` uses the same hook).
    Rejected: we would own, test and document a small home-made state library. Zustand is the
    widely known, documented version of the same idea (selectors, `getInitialState`, a testing
    guide), and the user chose it explicitly.
  - Redux Toolkit, Jotai or Valtio. Rejected: larger or a different model (atoms, proxies) for a
    single list with three actions.

## R2. One global store, not one per request

- **Decision**: Create the store once at module level with `create()`. Do not use a per-request
  store behind a React Context.
- **Rationale**:
  - Zustand's Next.js guide recommends "No global stores", because a server handles many
    requests and a module-level store would be shared between them. Its remedy is a store per
    request, handed down through a Context provider, which would bring back the wrapper this
    feature removes.
  - The risk the guide describes does not arise here:
    - The server only ever reads the store's initial state: the same mock data for every visitor.
    - Every write happens in a client event handler or effect (R3, R5), never during render and
      never on the server.
    - So no request can see another request's changes.
  - Hydration is safe. Zustand's hook passes `() => selector(api.getInitialState())` as the
    server snapshot to `useSyncExternalStore` (`react.js`, checked), so the server render and the
    first client render both use the mock data.
  - Both Next.js routing concerns from the guide are handled explicitly:
    - The store survives client-side navigation, which FR-003 wants.
    - Log-out clears it on purpose (R5).
- **Rules that follow** (in [contracts/components.md](contracts/components.md)):
  - The store is imported only by client components.
  - Server Components never read or write it.
  - Nothing writes to it during render.
  - It holds only data that is the same for every visitor.
- **Revisit when**: per-user data arrives. With Convex, the ticket data will most likely come from
  Convex's own hooks, and the store will shrink or go away. A global store must never hold data
  fetched for one user on the server.
- **Alternatives considered**:
  - A per-request store with `createStore` and a Context provider, as the Zustand guide
    recommends. Rejected: it reintroduces the provider in the layout and in tests (FR-006,
    FR-010), and it protects against server writes that this app never makes.

## R3. Store shape and actions

- **Decision**: In `lib/tickets/store.ts`:
  - The store's state is `{ tickets: Feedback[] }`, starting at `mockFeedback`.
  - The actions are plain functions exported from the module: `markRead`, `sendReply`,
    `createIssue` and `resetTickets`. This is Zustand's "practice with no store actions".
  - The first three run the existing `ticketsReducer`, so the ticket rules and their tests stay
    as they are.
  - `resetTickets` replaces the state with `getInitialState()`.
  - Containers read the list with `useTicketsStore((state) => state.tickets)` and pass the
    action functions straight to the components as callbacks.
- **Rationale**:
  - The containers become plain to read: one line to read the tickets, and the callbacks are the
    actions themselves. For example, `onOpenTicket={markRead}` replaces
    `onOpenTicket={(id) => dispatch({ type: "markRead", id })}`.
  - Actions need no hook, so `ResetTickets` (R5) and tests can call them anywhere.
  - Zustand's guide says this pattern has no downsides.
  - `ticketsReducer` already returns the same array for disallowed actions (spec 002). The
    `state.tickets` selector then returns the same reference, so no component re-renders.
- **Pitfall avoided**: Zustand 5 compares selector results by reference. A selector that builds
  a new object or array, such as `(state) => getNewCounts(state.tickets)`, returns a new value on
  every call and makes React loop until it throws. Selectors return `state.tickets` only. Counts
  and lists are computed outside the selector, as today.
- **Alternatives considered**:
  - Actions kept inside the store (Zustand's default). Rejected: each container would need one
    selector per action, or `useShallow`, to get them out.
  - Keep a single `dispatch(action)` (Zustand's "redux-like" recipe). Rejected: it keeps
    today's verbose call sites, which is what the feature tries to improve.
  - Write the rules inside the actions and drop `ticketsReducer`. Rejected: it moves tested logic
    for no gain. The reducer stays the one place that implements spec 001's rules.

## R4. Where the mock data enters

- **Decision**: `lib/tickets/store.ts` imports `mockFeedback` as the store's initial state.
  `app/(admin)/layout.tsx` stops importing it. It still imports `mockUser` and `mockWorkspace`.
- **Rationale**:
  - Constitution Principle V forbids *components* from importing mock data. The store is a data
    module, not a component, so this follows the rule.
  - Spec 002, R2 said that only the layout imports mock data. After this change, the store and
    the layout are the two places that know where admin data comes from, and both change when
    Convex arrives.
- **Alternatives considered**:
  - The layout hands `mockFeedback` to a component that writes it into the store while
    rendering. Rejected: a write during render runs on the server too (breaks R2), and it makes
    the layout a wrapper again in all but name.
  - Write it in an effect. Rejected: the first render would show an empty inbox and zero
    counts, and the server HTML would not match the client.

## R5. Clearing ticket changes on log-out (FR-008)

- **Finding (2026-11-22)**: the changes survive log-out today. Checked in headless Firefox:
  - 4 unread tickets, then 3 after opening one.
  - After "Log ud" and then "Log ind igen", still 3.
  - The hidden admin DOM was still in the document while the logged-out page was shown.

  Spec 002, R3 expected that leaving the `(admin)` group unmounts the provider. With Cache
  Components, Next.js hides the group's layout with `<Activity>` instead, the same mechanism as
  spec 003, R9.
- **Decision**:
  - A small client component, `components/ResetTickets/ResetTickets.tsx`, calls
    `resetTickets()` in a `useEffect` and renders nothing.
  - `app/logged-out/page.tsx` renders it.
- **Rationale**:
  - Being on the logged-out page *is* being logged out.
  - React runs an effect when the component mounts and again each time `<Activity>` shows it
    after hiding it (`preserving-ui-state.md`, "Effect and media cleanup"). So the tickets are
    cleared:
    - on every arrival at the page, including with the browser's Forward button
    - before the admin can return with "Log ind igen" or the Back button (US3-3)
  - The presentational `SideMenu` and `UserBlock` stay unchanged (FR-007).
  - On a direct visit or a reload of `/logged-out`, the store is already fresh, so the reset has
    no visible effect. That matches spec 002's edge case "it does not log anyone in or out by
    itself".
  - The reset is idempotent, so React's development double effects are harmless.
- **Alternatives considered**:
  - Reset in the log-out link's click handler. Rejected: the handler would have to come from
    `SideMenuContainer` through new `SideMenu` and `UserBlock` props, which changes
    presentational components (FR-007). It also does not run on Forward navigation.
  - A full page load on log-out (`<a href>` or `window.location.href`, which the Next.js docs
    mention for log-out flows). Rejected: it reloads the whole app. Also, the browser's
    back-forward cache can restore the earlier page, changes included, when the admin presses
    Back (against US3-3).
  - `useRouter().bfcacheId` as a key. Rejected: the docs call it mainly a migration tool, and it
    restores state on Back and Forward.

## R6. Test isolation (FR-010)

- **Decision**:
  - `vitest.setup.ts` calls `resetTickets()` in its existing `afterEach`, next to `cleanup()`.
  - A test that needs particular tickets sets them in one line before rendering:
    `useTicketsStore.setState({ tickets })`.
  - Tests that rely on the mock data, such as `layout.test.tsx` with "4 nye", need no setup.
- **Rationale**:
  - A module-level store keeps its state between tests in the same file, unlike a provider,
    which starts fresh on every `render`. The global reset makes every test start from the mock
    data whatever earlier tests did (US2-3).
  - Vitest already isolates modules per test file, so files cannot affect each other.
- **Alternatives considered**:
  - Zustand's testing guide mocks `zustand` (`__mocks__/zustand.ts` plus `vi.mock`) so that every
    store resets after each test. Rejected for now: more machinery for a single store. Adopt it
    if a second store is added.
  - A reset in each test file. Rejected: easy to forget, and a forgotten reset fails in
    confusing ways.

## R7. Tests that change or go away

- `components/TicketsProvider/TicketsProvider.test.tsx` is deleted along with the provider. Its
  three tests are replaced as follows:
  - "gives children the initial tickets" becomes a store test: initial tickets equal
    `mockFeedback`.
  - "shares dispatched changes with every consumer" becomes store tests (each action changes
    `getState().tickets`). The existing integration test, where opening a ticket lowers the menu
    count, keeps covering the sharing between components.
  - "throws a clear error outside the provider" is removed. There is no provider to be outside
    of (spec FR-011).
- In `Inbox.test.tsx`, `Inbox.keyboard.test.tsx`, `SideMenu.integration.test.tsx` and
  `SideMenuContainer.test.tsx`, each `<TicketsProvider initialTickets={x}>` wrapper becomes
  `useTicketsStore.setState({ tickets: x })` before `render`. All assertions stay (SC-001).
- Remount tests that called `rerender` with a fresh provider now rerender the container alone.
  They no longer set the tickets again, so the store's changes carry over, which is the point of
  those tests.
- `lib/tickets/state.test.ts` and `lib/tickets/counts.test.ts` are unchanged.

## R8. Documents from earlier specs

Spec 003 left notes in older specs when it changed their decisions, so this spec does the same.
Requirements (`spec.md`) and finished task lists (`tasks.md`) are not touched. Each note says what
changed and links to this research:

| File | Section | Note |
|------|---------|------|
| `specs/002-side-menu/research.md` | R1 | Ticket data now lives in a Zustand store; the rejection of Zustand is superseded (R1 here) |
| `specs/002-side-menu/research.md` | R2 | Mock tickets now enter in `lib/tickets/store.ts`; the containers read the store (R3, R4) |
| `specs/002-side-menu/research.md` | R3 | Leaving the group did not unmount the provider; log-out now clears the store (R5) |
| `specs/002-side-menu/data-model.md` | State split | Owner of the tickets: `lib/tickets/store.ts`; cleared on log-out |
| `specs/002-side-menu/contracts/components.md` | Layout, Ticket state, containers | Point to this spec's contract |
| `specs/002-side-menu/plan.md` | Constitution IV row, structure | Point to R1 here |
| `specs/001-feedback-inbox/contracts/components.md`, `data-model.md` | "Superseded by spec 002" notes | Name the store instead of `TicketsProvider` |
| `specs/003-search-top-bar/research.md` | Intro, R1, R9 | Ticket data lives in the store |
| `specs/003-search-top-bar/data-model.md` | Lifecycle | "dispatches to `TicketsProvider`" becomes "calls a store action" |

The code comments that name the provider are updated with the code:

- `app/(admin)/page.tsx`
- `app/(admin)/layout.tsx`
- `app/logged-out/page.tsx`
- `components/inbox/Inbox.tsx`
- `components/inbox/Inbox.test.tsx`
- `components/side-menu/SideMenu.integration.test.tsx`
