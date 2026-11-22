# Research: Search Top Bar

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-18

Checked against the installed Next.js 16.4.6 docs in `apps/admin/node_modules/next/dist/docs/`
(`apps/admin/AGENTS.md`). These decisions from specs 001 and 002 still apply:

- Figma icons are loaded via `next/image` and tokens live in `globals.css` (spec 001).
- Ticket data lives in `TicketsProvider`, while the inbox keeps its own view state, which
  resets on remount (spec 002, R1). *Changed by spec 004 (2026-11-22): ticket data now lives in
  the Zustand store `lib/tickets/store.ts`
  ([spec 004 research R1](../004-zustand-ticket-store/research.md#r1-adding-zustand-constitution-principle-iv)).*
- The breakpoint is 1024px (spec 002, User Story 4).

## R1. Where the search text lives

- **Decision**: Add the search text to the inbox's view state, as `InboxView.search` with a
  `setSearch` action in `lib/inbox/state.ts`. It starts as `""` in `createInitialView()`.
- **Rationale**: The spec makes the search part of the inbox view (FR-015, Key Entities). The
  view already resets whenever the inbox remounts (spec 002, R1), so the search is empty after
  moving to another page and back, or after a reload, with no extra code. Keeping it in the
  reducer next to the filters also keeps it a pure function that is easy to test.
- **Alternatives considered**:
  - Put the search in the URL with `next/form` or `useSearchParams`. Rejected: the spec keeps
    the search out of the web address (Assumptions). The `<Form>` component
    (`01-app/03-api-reference/02-components/form.md`) navigates on submit and appends the input
    to the URL. `useSearchParams` under Cache Components also needs a `<Suspense>` boundary.
  - A separate `useState` in `Inbox`. Rejected: it would split the view state across two
    places, and the tests for the pure reducer would no longer cover it.
  - Put it in `TicketsProvider`. Rejected: the provider lives in the layout and survives
    navigation, which breaks FR-015. *Spec 004 replaced the provider with a store that also
    survives navigation, so the same reasoning applies to the store.*

## R2. How tickets are matched

- **Decision**: Add a pure module, `lib/inbox/search.ts`:
  - `getSearchWords(search)` trims the text, lowercases it with `toLowerCase()`, splits it on
    runs of whitespace and drops empty strings.
  - `matchesSearch(ticket, words)` joins the ticket's searched details with `"\n"`, lowercases
    them and checks that **every** word occurs with `String.prototype.includes`. The details
    joined are the description, `formatTicketNumber(number)`, the sender's name, email and
    company, `PLATFORM_LABELS[platform]` and `getPagePath(pageUrl)`.
  - An empty word list matches every ticket.
- **Rationale**:
  - Every word is matched with `includes`. Nothing the admin types is turned into a pattern, so
    `*`, `.`, `(` and `<b>` match only themselves (FR-009).
  - The only regular expression is the fixed `/\s+/` used for splitting.
  - `toLowerCase()` handles æ/ø/å (`"Ø".toLowerCase() === "ø"`), and it doesn't fold "ø"
    into "o" or "oe" (edge cases).
  - The number, platform label and path come from the helpers the UI already uses, so search
    matches exactly what is shown (FR-008: "as shown").
  - Joining with `"\n"` means a word, which never contains whitespace, cannot match across
    two details.
- **Results with the mock data**, checked with a script before planning (16 tickets):

  | Search | Tickets found |
  |--------|---------------|
  | "anna" | #FB-1042 (Anna Holm) and #FB-1030 (Nanna Friis) |
  | "anna overview" | #FB-1042 only |
  | "/keywords" | 3 tickets |
  | "csv" | #FB-1041 only |
  | "1042" | #FB-1042 only |
  | "mørk" or "MØRK" | #FB-1033 only |
  | "a.b" | none |

- **Alternatives considered**:
  - A fuzzy search library such as Fuse.js. Rejected: it is a new dependency (Constitution IV),
    and fuzzy matches would break the "exactly the matching tickets" check (SC-002).
  - Building a `RegExp` from escaped input. Rejected: more code and an injection risk, for no
    gain over `includes`.
  - `Intl.Collator` or `localeCompare`. Rejected: they compare whole strings and cannot find a
    word inside a text.
  - Matching the whole search as one phrase. Rejected: the spec requires every word to match,
    anywhere (FR-007, US1-4).

## R3. Combining the search with filters, counts and the open ticket

- **Decision**:
  - In `lib/inbox/select.ts`, a private `inScope(tickets, view)` applies the category filter,
    then the search.
  - `getVisibleTickets(tickets, view)` takes `inScope`, then applies the All/Done filter and
    sorts.
  - `getCounts` changes from `(tickets, category)` to
    `(tickets, view: Pick<InboxView, "categoryFilter" | "search">)` and counts within `inScope`.
  - `getSelectedTicket` is unchanged: it already returns `null` when the visible list does not
    contain the open ticket.
- **Rationale**:
  - The counts must follow the search just as they follow the category (FR-010).
  - Building the hidden-ticket rule on `getVisibleTickets` gives FR-012 for free. The view's
    `selectedId` is kept, so the ticket reappears open once the search is cleared.
- **Alternatives considered**: Filter by search in `Inbox` before calling the selectors.
  Rejected: the counts and the selected ticket would then need separate wiring, and the
  combination would not be covered by the selector tests.

## R4. Performance (SC-003)

- **Decision**: Filter during render with no memoization, `useDeferredValue` or debounce. A
  unit test filters 1,000 generated tickets and asserts that it finishes well under the 0.2 s
  budget.
- **Rationale**: Each keystroke handles 1,000 short strings, which takes about a millisecond.
  Extra machinery would add complexity without a measurable gain (Constitution IV).
- **Alternatives considered**: Use `useMemo` per ticket, or `useDeferredValue` for the query.
  Rejected for now; revisit only if a real inbox becomes slow.

## R5. Markup and accessibility

- **Decision**:
  - Use `<div role="search">` wrapping a `<label className="search-field">`. Inside the label
    go the decorative search `Icon` and an `<input type="search">` with
    `aria-label="Søg i feedback"` and the placeholder "Søg i feedback, brugere, sider…".
  - There is no `<form>`. Escape is handled in `onKeyDown`: when the field has text it calls
    `onChange("")` and `preventDefault()`.
  - The native clear button (`::-webkit-search-cancel-button`) is hidden.
- **Rationale**:
  - `type="search"` gives the field the `searchbox` role, so screen readers announce it as a
    search field (FR-016).
  - The new field cannot be confused with the reply `textbox`, which the existing keyboard
    test looks up by role.
  - Without a `<form>`, Enter submits nothing, so the page cannot reload (FR-006).
  - Firefox does not clear a search field on Escape, while Chrome and Safari do. Handling
    Escape ourselves gives the same behaviour everywhere (FR-013).
  - The design has no clear button, and Firefox shows none. Hiding WebKit's keeps the browsers
    consistent.
  - Tailwind's preflight already removes `::-webkit-search-decoration`.
  - The global `:focus-visible` outline already covers the input.
- **Alternatives considered**:
  - The HTML `<search>` element. React 19's types support it, but `aria-query` (which Testing
    Library uses) does not map it to the `search` role, so tests could not find it.
  - `<form role="search">` with `preventDefault` on submit. This needs an extra handler and
    adds nothing.
  - A visually hidden `<label>` instead of `aria-label`. Equivalent, but the project has no
    `sr-only` convention and already uses `aria-label` for "Åbn menu" and "Log ud".

## R6. Layout: a full-width bar inside the padded content area

- **Decision**:
  - `Inbox` renders `<SearchBar>` as a sibling *before* `<section className="inbox">`, in a
    fragment.
  - The bar cancels the content area's padding with negative margins:
    `margin: calc(var(--page-padding) * -1) calc(var(--page-padding) * -1) var(--page-padding)`.
    Below 1024px the same rule uses `--page-padding-compact`. The bar therefore spans
    `main` from edge to edge, and the toolbar follows at the normal page padding.
  - The bar scrolls with the page (not sticky; spec Assumptions).
  - Rename the unused `.topbar` class from spec 001 to `.search-bar`, and the token
    `--topbar-height` to `--search-bar-height`. The bar keeps its 63px height, white
    background and 1px `--border-color` bottom line.
- **Rationale**:
  - Only the inbox shows the bar (FR-005), and its text belongs to the inbox view (R1), so
    `Inbox` must render it.
  - Negative margins let it span `main` without changing `AppShell` or the other pages.
  - Placing it outside `.inbox` keeps that column's 12px gap between toolbar and columns
    unchanged.
  - The rename avoids having both `.topbar` (this bar) and `.top-bar` (the menu-button bar
    from spec 002).
- **Gap below the bar**: Figma shows 23px between the bar and the page heading "Feedback inbox",
  which is a separate feature. Until that heading exists, the toolbar follows at the page
  padding, the same distance it has from the top of the page today.
- **Alternatives considered**:
  - A "top bar" slot in `AppShell`, filled by the page. Rejected: the bar's text would have to
    be lifted out of the inbox view into a shared context, which breaks FR-015 or adds
    plumbing.
  - Removing `main`'s padding and padding every page itself. Rejected: it touches every page
    for one bar.

## R7. Visual values and the search icon

- **Wide windows (≥ 1024px)**: Figma metadata gives the bar (`323:1707`) as 1170 × 63 with a
  1px line at y = 62, and the field (`323:1709`) as 420 × 39 at x = 32, y = 11. Measuring
  `design/top-bar.png` confirms the colours, which all match existing tokens and the unused
  `.search-input` class from spec 001:
  - bar: `#ffffff` = `--surface`
  - bottom line: `#dddddd` = `--border-color`
  - field: background `#f0f2f8` = `--surface-sunken`, 1px border `#dddddd`, radius
    `--radius-pill`
  - icon and placeholder: `#888888` = `--text-subtle`
  - icon: 16px from the field's left edge
  - text: starts 43px in, i.e. 1px border + the existing 42px left padding
- **New token**: `--search-width: 420px` (Figma `323:1709`).
- **Narrow windows (< 1024px)**: the Figma MCP call limit was reached during planning, so these
  values were measured from `../002-side-menu/design/page-tablet.png`, the 834px export of
  Figma frame `356:435`:

  | Element | Value |
  |---------|-------|
  | Field size and position | 786 × 41, at the 24px page margins |
  | Field border | none |
  | Icon | 13px from the field's left edge |
  | Text | starts 37px in |
  | Space above the field | none: it sits directly under the top bar, whose own 12px bottom padding gives the gap |
  | Space below the field | 12px of white |
  | Line below the white band | none |

  These go into the `.search-bar` / `.search-field` rules inside the existing
  `@media (width < theme(--breakpoint-lg))` block. To keep the box size identical, the
  "no border" is a 1px transparent border.

  Re-check them against Figma node `356:435` once the MCP limit allows. The mobile frame
  `356:379` was not measured: phones use the tablet values (spec Assumptions).
- **Icon**: Figma node `323:1710` is the same 11.08px "Ikon – search" vector as the side menu's
  `public/icons/nav-search.svg`. It is stroked `#888888` instead of `#484848`, so it is not an
  exact match and cannot be reused. It must be downloaded from Figma as
  `public/icons/search.svg` and added to `Icon` at its root size.
  - First choice: the MCP (`get_design_context` on `323:1707`).
  - If the limit still blocks that, export the layer as SVG from the Figma app.
  - The SVG must not be edited by hand.

## R8. Copy (Danish)

| Where | Text |
|-------|------|
| Placeholder | "Søg i feedback, brugere, sider…" (one `…` character) |
| Accessible name | "Søg i feedback" |
| Empty list with an active search | "Ingen feedback matcher søgningen." |
| Empty list without a search | "Ingen feedback matcher filtrene." (unchanged) |

A search counts as active when `getSearchWords(view.search)` is non-empty, so a search of only
spaces shows the filter message.

## R9. Next.js keeps a page mounted after you navigate away (found during implementation)

- **Finding**:
  - With `cacheComponents`, Next.js 16 does not unmount a page when the admin navigates away.
    It hides the page with React's `<Activity mode="hidden">`, which keeps its state and DOM
    (`01-app/02-guides/preserving-ui-state.md`, `01-app/02-guides/migrating-to-cache-components.md`).
  - In the running app, going inbox → Indstillinger → inbox kept the search text, the filters and
    the open ticket.
  - This breaks FR-015 here, and FR-017 in spec 002, whose research R1 assumed the page
    remounts.
  - The component tests never caught it, because they remount the inbox by hand.
- **Decision**:
  - Add a `reset` action that returns `createInitialView()`.
  - `Inbox` dispatches it from a `useLayoutEffect` cleanup:
    `useLayoutEffect(() => () => dispatch({ type: "reset" }), [])`.
  - React runs the cleanup when Activity hides the page, and on unmount, so the view is back to
    its defaults before the page is shown again.
  - Ticket changes live in `TicketsProvider` and are not affected. *Since spec 004 they live in
    the ticket store (`lib/tickets/store.ts`). The same Activity behaviour also kept the admin
    layout alive after logging out, which spec 004 fixed
    ([research R5](../004-zustand-ticket-store/research.md#r5-clearing-ticket-changes-on-log-out-fr-008)).*
- **Rationale**:
  - This is the pattern the docs recommend for state that should reset ("When to reset it").
  - `useLayoutEffect` runs before the page is hidden, so no stale view flashes on return.
- **Alternatives considered**:
  - Using `useRouter().bfcacheId` as a `key`. Rejected: the docs call it mainly a migration
    tool. It also keeps the state on browser back and forward, which the specs don't ask for.
  - Keeping Activity's default and preserving the state. Rejected: it contradicts the agreed
    behaviour (spec 002, Clarifications Q1).
- **Tests**:
  - `Inbox.test.tsx` renders the inbox inside `<Activity>` and toggles it hidden and visible.
  - In the running app, the same steps were checked in headless Firefox.
- **Side effect**: on other pages the hidden inbox, including its search bar, is still in the
  DOM with `display: none`. It is not visible or focusable there, so FR-005 holds. Browser
  checks must test visibility, not presence.
