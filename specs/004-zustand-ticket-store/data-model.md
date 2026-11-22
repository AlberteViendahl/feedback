# Data Model: Shared Ticket Store

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-22

No shared data types change. `Feedback` and the other types in `lib/types.ts` stay as they are
(Constitution Principle II), and so do the ticket rules in `ticketsReducer` and `TicketAction` in
`lib/tickets/state.ts`. What changes is where the session's tickets are held, and when they are
cleared.

## Session ticket data (`lib/tickets/store.ts`, new)

| Field | Type | Initial | Notes |
|-------|------|---------|-------|
| `tickets` | `Feedback[]` | `mockFeedback` | The only field. Shared by the inbox and the side menu |

### Actions

These are module-level functions, not part of the state ([research R3](research.md#r3-store-shape-and-actions)).

| Action | Effect | Rule source |
|--------|--------|-------------|
| `markRead(id)` | `tickets = ticketsReducer(tickets, { type: "markRead", id })` | spec 001/002 |
| `sendReply(id, text, now)` | `tickets = ticketsReducer(tickets, { type: "sendReply", id, text, now })` | spec 001/002 |
| `createIssue(id)` | `tickets = ticketsReducer(tickets, { type: "createIssue", id })` | spec 001/002 |
| `resetTickets()` | Back to the initial state (`getInitialState()`), replacing the whole state | spec 004, FR-008 |

A disallowed action (unknown id, empty or second reply, second issue) leaves `tickets` as the
same array, so nothing re-renders (spec 002, data-model.md).

### Lifecycle

| Event | Tickets | Requirement |
|-------|---------|-------------|
| Page load or reload (any page) | The module is evaluated afresh, so the tickets equal `mockFeedback` | FR-004 |
| Opening, replying or creating an issue | Changed by the matching action | FR-001, FR-002 |
| Moving between admin pages | Kept; the store is independent of pages and layouts | FR-003 |
| Arriving at `/logged-out` (mounted, or shown again by `<Activity>`) | `ResetTickets` calls `resetTickets()`, so the tickets equal `mockFeedback` | FR-008, US3 |
| Returning with "Log ind igen", Back or Forward | Whatever the store holds now: after a log-out, the mock data | FR-008 |
| Server render and prerender | Read only, from the initial state. Never written ([research R2](research.md#r2-one-global-store-not-one-per-request)) | FR-005 |
| Each test (Vitest) | Reset to the initial state after every test; set by the test before rendering | FR-010 |

Each browser tab evaluates the module on its own, so each tab is its own session (spec edge case).

## Inbox view (`lib/inbox/state.ts`, unchanged)

The inbox view keeps the fields and the reset from spec 003 ([data model](../003-search-top-bar/data-model.md)).
Its `reset` action, run when Next.js hides the inbox, also covers log-out: the inbox is hidden
when the admin goes to `/logged-out`, so its view is at its defaults when they come back.

## Ownership after this change

| State | Owner | Lives | Cleared by |
|-------|-------|-------|------------|
| Session tickets | `lib/tickets/store.ts` (module) | The browser tab's lifetime | Reload; arriving at `/logged-out` |
| Inbox view | `Inbox` (`useReducer`) | While the inbox is shown | Hiding or remounting the inbox (spec 003, R9) |
| Menu open/closed | `AppShell` (`useState`) | While the admin layout is shown | Following a link in the menu (spec 002) |

This table replaces the "State split" table in
[spec 002's data model](../002-side-menu/data-model.md#state-split-changes-the-inbox-from-spec-001)
for the tickets row only.
