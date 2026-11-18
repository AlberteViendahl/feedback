# Data Model: Search Top Bar

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-18

No shared data types change. `Feedback`, `Sender` and `FeedbackContext` in `lib/types.ts` stay as
they are (Constitution II). The feature adds one field to the inbox's **view** state, plus a derived
search text per ticket. Neither is stored.

## Inbox view (`lib/inbox/state.ts`)

| Field | Type | Initial | Change |
|-------|------|---------|--------|
| `statusFilter` | `"all" \| "done"` | `"all"` | unchanged |
| `categoryFilter` | `"all" \| FeedbackCategory` | `"all"` | unchanged |
| `sortOrder` | `"newest" \| "oldest"` | `"newest"` | unchanged |
| `selectedId` | `string \| null` | `null` | unchanged; kept while the search hides the ticket (FR-012) |
| `replyDraft` | `string` | `STANDARD_REPLY` | unchanged |
| `notice` | `InboxNotice` | `null` | unchanged |
| **`search`** | `string` | `""` | **new**: the text exactly as typed. It is not trimmed, so the field shows what the admin typed |

### Actions

| Action | Effect |
|--------|--------|
| `{ type: "setSearch"; value: string }` | **new**: `search = value`. Nothing else changes: not the selection, the draft, the notice or the filters |
| `{ type: "reset" }` | **new**: returns `createInitialView()`. `Inbox` dispatches it when Next.js hides the page or it unmounts ([research R9](research.md#r9-nextjs-keeps-a-page-mounted-after-you-navigate-away-found-during-implementation)) |
| all existing actions | unchanged; none of them touches `search` |

### Lifecycle

- `createInitialView()` returns `search: ""`, so the search is empty on first load and after a
  reload.
- Next.js keeps the inbox page mounted but hidden when the admin navigates away. `Inbox`
  therefore dispatches `reset` from a `useLayoutEffect` cleanup, so the search and the rest of
  the view are back to their defaults on return (FR-015; spec 002 FR-017;
  [research R9](research.md#r9-nextjs-keeps-a-page-mounted-after-you-navigate-away-found-during-implementation)).
- Typing dispatches `setSearch` with the field's full value. Escape in a non-empty field
  dispatches `setSearch` with `""` (FR-013).
- Searching never dispatches to `TicketsProvider`, so ticket data and the side-menu counts are
  untouched (FR-014).

## Search words (derived, `lib/inbox/search.ts`)

`getSearchWords(view.search)` gives the search as a list of words:

1. Trim the text.
2. Lowercase it with `toLowerCase()`.
3. Split it on runs of whitespace.
4. Drop empty strings.

An empty list means "no search": every ticket matches, and the empty list shows the filter
message (research R8).

| Typed | Words |
|-------|-------|
| `""` or `"   "` | `[]` |
| `"  Anna   Overview "` | `["anna", "overview"]` |
| `"#FB-1042"` | `["#fb-1042"]` |
| `"a.b"` | `["a.b"]` (literal; no pattern) |

## Searched details per ticket (derived)

The ticket matches when **every** word occurs in at least one of these details (FR-007, FR-008),
ignoring case:

| Detail | Source | Example |
|--------|--------|---------|
| Feedback text (all lines) | `ticket.description` | "When I click “Add website” nothing happens…" |
| Ticket number as shown | `formatTicketNumber(ticket.number)` | "#FB-1042" |
| Sender name (if any) | `ticket.sender.name` | "Anna Holm" |
| Sender email | `ticket.sender.email` | "anna@company.dk" |
| Sender company | `ticket.sender.company` | "Company ApS" |
| Platform name | `PLATFORM_LABELS[ticket.context.platform]` | "GEOtracking" |
| Page path as shown | `getPagePath(ticket.context.pageUrl)` | "/overview" (unsafe URLs: the raw text) |

These details are not searched: browser, operating system, screen size, user ID, plan,
attachments, reply, status and category. The category and status have their own filters.

## Visible tickets and counts (`lib/inbox/select.ts`)

```text
tickets
  └─ category filter          (view.categoryFilter)
      └─ search               (view.search)           ← new
          ├─ getCounts → { all, done }                 counts follow the search (FR-010)
          └─ All/Done filter  (view.statusFilter)
              └─ sort         (view.sortOrder)
                  └─ getVisibleTickets
                      └─ getSelectedTicket: the open ticket only if visible (FR-012)
```
