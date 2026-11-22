# Data Model: Side Menu

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-17

New shared types go in `apps/admin/lib/types.ts` (Constitution II), next to the existing
`Feedback` types from spec 001. Like those, they mirror planned Convex tables (`_id`).

## New entities

### Workspace

| Field | Type | Rules |
|-------|------|-------|
| `_id` | `string` | Unique. |
| `name` | `string` | Required, e.g. "Organic Growth". Shown as-is (not translated). |
| `platforms` | `Platform[]` | One or more, unique, in display order. `Platform` is the existing union `"geotracking" \| "simpleserp"`. |

### AdminUser

| Field | Type | Rules |
|-------|------|-------|
| `_id` | `string` | Unique. |
| `name` | `string` | Required, e.g. "Hussein". The avatar shows its first letter, upper-cased. |
| `role` | `string` | Required, e.g. "Admin". Shown as-is. |
| `workspaceId` | `string` | The `_id` of the workspace the user belongs to. The user block shows that workspace's `name`. |

### Platform (existing, extended with shared metadata)

`Platform` stays a string union in `lib/types.ts`. Display data moves to the new shared module
`lib/platforms.ts`:

| Export | Value |
|--------|-------|
| `PLATFORMS` | `["geotracking", "simpleserp"]` – every known platform id |
| `PLATFORM_LABELS` | `{ geotracking: "GEOtracking", simpleserp: "SimpleSERP" }` (moved from `lib/inbox/format.ts`) |
| `isPlatform(value: string): value is Platform` | Type guard used by the platform page before calling `notFound()` |

The URL segment of a platform page is its id: `/platforms/geotracking`.

## Derived data

### NewCounts (`lib/tickets/counts.ts`)

```text
getNewCounts(tickets: Feedback[]) → { total: number; byPlatform: Record<Platform, number> }
```

- A ticket counts as new when `isRead === false`.
- `byPlatform[p]` = new tickets whose `context.platform === p`; every platform key is present
  (0 when none).
- `total` = sum of `byPlatform`.
- Zero counts are hidden by the UI, not removed from the data.

### Active menu item (`lib/side-menu/active-href.ts`)

```text
getActiveHref(pathname: string, hrefs: string[]) → string | null
```

Returns the entry of `hrefs` that equals `pathname` exactly, otherwise `null` (e.g. on a
not-found page). `hrefs` are the menu's targets: `/`, `/platforms/<id>` for each workspace
platform, and `/settings`.

## State split (changes the inbox from spec 001)

Spec 001 kept tickets and view state together in the inbox's reducer. To share tickets with the
menu (FR-006) while resetting the view on navigation (FR-017), the state is split in two:

| State | Owner | Lives | Contents |
|-------|-------|-------|----------|
| **Tickets** | `TicketsProvider` in `app/(admin)/layout.tsx` | Whole admin session, across page navigation; reset on reload or after logging out | `Feedback[]` |
| **Inbox view** | `Inbox` component | While the inbox page is shown; reset when it remounts | `statusFilter`, `categoryFilter`, `sortOrder`, `selectedId`, `replyDraft`, `notice` |

> **Changed by spec 004 (2026-11-22):**
>
> - The tickets' owner is now the Zustand store `lib/tickets/store.ts`, not `TicketsProvider`.
>   The tickets still reset on reload.
> - On logging out, the store is cleared when the admin arrives at `/logged-out`. The provider was
>   never unmounted there.
>
> See [spec 004's data model](../004-zustand-ticket-store/data-model.md).

### Ticket actions (`lib/tickets/state.ts`, moved from `lib/inbox/state.ts`)

Same rules as spec 001's data model, now addressed by ticket id:

| Action | Allowed when | Effect on the ticket |
|--------|--------------|----------------------|
| `markRead { id }` | ticket exists | `isRead = true` |
| `sendReply { id, text, now }` | ticket has no `reply` and `text.trim()` is non-empty | `reply = { text: trimmed, sentAt: now }`, `status = "done"` |
| `createIssue { id }` | `githubIssueCreated === false` | `githubIssueCreated = true`; `status = "in_progress"` unless `"done"` |

Disallowed actions are no-ops that return the same array (so React skips re-rendering).

### Inbox view actions (`lib/inbox/state.ts`, reduced)

| Action | Effect |
|--------|--------|
| `select { id }` | `selectedId = id`, `replyDraft = STANDARD_REPLY`, `notice = null` (the container also dispatches `markRead`) |
| `setStatusFilter`, `setCategoryFilter`, `setSortOrder` | as before |
| `editReply { text }` | `replyDraft = text` |
| `showNotice { notice }` | `notice = "reply-sent" \| "issue-created"` (dispatched after the matching ticket action) |

Selectors in `lib/inbox/select.ts` take `(tickets, view)` instead of the combined state.

## Mock data (`lib/mock-workspace.ts`)

```text
mockWorkspace = { _id: "ws_organic_growth", name: "Organic Growth", platforms: ["geotracking", "simpleserp"] }
mockUser      = { _id: "user_hussein", name: "Hussein", role: "Admin", workspaceId: "ws_organic_growth" }
```

Counts come from the existing `mockFeedback`: GEOtracking 3 new, SimpleSERP 1 new, workspace
4 new (the screenshots show 8 / 4 / 12; the difference is expected, see spec Assumptions).
