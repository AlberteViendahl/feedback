# UI Contracts: Search Top Bar

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

This document covers the component props, pure-function signatures and CSS classes for this
feature, plus the changes it makes to the inbox contract from specs 001 and 002
([../../002-side-menu/contracts/components.md](../../002-side-menu/contracts/components.md)).

The folder convention from spec 001 still applies:

- The main component sits at the root of its feature folder.
- Each sub-component has its own folder, named after it.
- There are no `index.ts` files.

## Route

The feature adds no route. The bar appears on `/` only, because only `Inbox` renders it (FR-005).
The platform, settings, not-found and logged-out pages are unchanged.

## Search bar (`components/inbox/SearchBar/SearchBar.tsx`)

The component is presentational, with no state of its own.

```ts
type SearchBarProps = {
  value: string                       // the search text as typed (InboxView.search)
  onChange: (value: string) => void   // every edit, and "" on Escape
}
function SearchBar(props: SearchBarProps): JSX.Element
```

It renders:

```html
<div class="search-bar" role="search">
  <label class="search-field">
    <Icon name="search" />                       <!-- decorative: alt="" -->
    <input type="search" class="search-input"
           aria-label="Søg i feedback"
           placeholder="Søg i feedback, brugere, sider…"
           value={value} onChange onKeyDown />
  </label>
</div>
```

Behaviour:

| Input | Result |
|-------|--------|
| Typing or deleting | `onChange(event.target.value)`, with the value untrimmed |
| Escape with a non-empty value | `preventDefault()` and `onChange("")`; focus stays in the field |
| Escape with an empty value | nothing |
| Enter | nothing; there is no form, so nothing is submitted |

The component does not import mock data and does not read the provider (Constitution V).

## Inbox (`components/inbox/Inbox.tsx`, changed)

- `Inbox` returns a fragment: `<SearchBar>` first, then the existing
  `<section className="inbox">`. Its props are unchanged.
- `SearchBar` gets `value={view.search}` and
  `onChange={(value) => dispatch({ type: "setSearch", value })}`.
- `Toolbar` gets `counts={getCounts(tickets, view)}` (signature change below).
- `TicketList` gets `isSearching={getSearchWords(view.search).length > 0}`.
- `useLayoutEffect(() => () => dispatch({ type: "reset" }), [])` resets the view when Next.js
  hides the page after navigation (Cache Components keeps it mounted;
  [research R9](../research.md#r9-nextjs-keeps-a-page-mounted-after-you-navigate-away-found-during-implementation)).

## Ticket list (`components/inbox/TicketList/TicketList.tsx`, changed)

```ts
type TicketListProps = {
  tickets: Feedback[]
  selectedId: string | null
  now: number | null
  /** New: picks the empty-state text. */
  isSearching: boolean
  onSelect: (id: string) => void
}
```

When the list is empty, it shows "Ingen feedback matcher søgningen." if `isSearching` is true,
and "Ingen feedback matcher filtrene." otherwise (FR-011).

## Pure functions

```ts
// lib/inbox/search.ts — new
function getSearchWords(search: string): string[]
// trim → toLowerCase → split(/\s+/) → drop "" ; "" and "   " → []
function matchesSearch(ticket: Feedback, words: string[]): boolean
// true when words is empty, or every word is a substring of the ticket's searched details
// (data-model.md "Searched details per ticket"), compared in lower case

// lib/inbox/state.ts — changed
type InboxView = { statusFilter; categoryFilter; sortOrder; selectedId; replyDraft; notice; search: string }
type InboxViewAction =
  | …existing actions…
  | { type: "setSearch"; value: string }   // new
  | { type: "reset" }                       // new: back to createInitialView() (research R9)
function createInitialView(): InboxView    // now includes search: ""

// lib/inbox/select.ts — changed
function getVisibleTickets(tickets: Feedback[], view: InboxView): Feedback[]
// category → search → All/Done → sort
function getCounts(
  tickets: Feedback[],
  view: Pick<InboxView, "categoryFilter" | "search">,
): { all: number; done: number }           // CHANGED: was (tickets, category)
function getSelectedTicket(tickets: Feedback[], view: InboxView): Feedback | null  // unchanged
```

`matchesSearch` reuses the following and does not copy their logic:

- `formatTicketNumber` and `getPagePath` from `lib/inbox/format.ts`
- `PLATFORM_LABELS` from `lib/platforms.ts`

## Icon (`components/Icons/Icon.tsx`, changed)

Add `search` to `ICONS`, sized from the root of the SVG downloaded from Figma node `323:1710`
(research R7). The SVG goes in `public/icons/search.svg`. The menu's `nav-search` icon is not
reused, because its stroke colour differs.

## CSS (`app/globals.css`, changed)

| Class / token | Change | Wide windows (≥ 1024px) | Narrow windows (< 1024px) |
|---------------|--------|--------------------------|----------------------------|
| `--search-bar-height` | renamed from `--topbar-height` | 63px | unused (height follows content) |
| `--search-width` | **new** (Figma `323:1709`) | 420px | – |
| `.search-bar` | renamed from the unused `.topbar`; now a flex row | height `--search-bar-height`, `--surface`, 1px `--border-color` bottom line, padding `0 var(--page-padding)`, field 11px from the top, margins cancel `main`'s padding (research R6) | no fixed height, no bottom line, padding `0 var(--page-padding-compact) 12px`, margins cancel the compact padding |
| `.search-field` | **new**: positions the icon over the input | `position: relative`, width `--search-width`, `max-width: 100%` | width 100% |
| `.search-field` icon | **new** | absolute, 16px from the left, centred vertically | 13px from the left |
| `.search-input` | existing (spec 001), extended | width 100%; keeps 39px height, 42px left padding, `--surface-sunken`, `--border-color` border, `--radius-pill`, `--text-subtle` placeholder | height 41px, transparent border, 36px left padding (text starts 37px in) |
| `.search-input::-webkit-search-cancel-button` | **new** | `appearance: none` (no native clear button) | same |

The narrow-window rules go inside the existing `@media (width < theme(--breakpoint-lg))` block.
At no width may the bar cause horizontal scrolling (FR-004).

## Docs from earlier specs to update

The signatures of `getCounts` and `TicketList` change, so update these two contracts:

- [../../002-side-menu/contracts/components.md](../../002-side-menu/contracts/components.md),
  under "Inbox": `getCounts` is no longer "unchanged".
- [../../001-feedback-inbox/contracts/components.md](../../001-feedback-inbox/contracts/components.md):
  `getCounts` and `TicketListProps`.

In each, point to this document instead of repeating it.
