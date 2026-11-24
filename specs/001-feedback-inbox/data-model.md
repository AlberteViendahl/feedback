# Data Model: Feedback Inbox

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-17

All shared types live in `apps/admin/lib/types.ts` (Constitution II) and mirror a planned Convex
`feedback` table. When `convex/schema.ts` is written, these types are replaced by Convex's
generated `Doc<"feedback">` and the handwritten module is deleted.

## Enumerations

| Type | Values | Danish label (UI) |
|------|--------|-------------------|
| `FeedbackCategory` | `"bug"`, `"idea"`, `"general"` | Fejl, Forslag, Generel feedback |
| `FeedbackStatus` | `"open"`, `"in_progress"`, `"done"` | (no badge), I gang, Færdig |
| `Platform` | `"geotracking"`, `"simpleserp"` | GEOtracking, SimpleSERP |
| `AttachmentKind` | `"image"`, `"video"` | – |

"New" (Ny) is not a status. It is derived from `isRead === false` (see Badge rule below).

## Entities

### Feedback (one ticket)

| Field | Type | Rules |
|-------|------|-------|
| `_id` | `string` | Unique. Convex document id. |
| `_creationTime` | `number` (ms since epoch) | Time the feedback was sent. Used for sorting and relative time. |
| `number` | `number` | Unique, positive. Shown as `#FB-{number}`, e.g. `#FB-1042`. |
| `category` | `FeedbackCategory` | Required. |
| `description` | `string` | Required, non-empty. Untrusted; rendered as plain text, line breaks preserved. |
| `status` | `FeedbackStatus` | Required. See state transitions. |
| `isRead` | `boolean` | `false` until an admin opens the ticket. |
| `githubIssueCreated` | `boolean` | `true` once "Opret GitHub-issue" has been used. Never goes back to `false`. |
| `reply` | `Reply \| undefined` | At most one. Once set, never changes. |
| `completedAt` | `number \| undefined` (ms since epoch) | Time the ticket became `done`; set with `status`. Added by [spec 005](../005-key-numbers-row/data-model.md). |
| `sender` | `Sender` | Required. |
| `context` | `FeedbackContext` | Required. |
| `attachments` | `Attachment[]` | Zero or more. |

### Sender (embedded)

| Field | Type | Rules |
|-------|------|-------|
| `name` | `string \| undefined` | Optional. When missing, the email is shown instead. |
| `email` | `string` | Required. |
| `userId` | `string` | Required, shown as `ID {userId}`. |
| `company` | `string` | Required. |
| `plan` | `string` | Required, e.g. `"Pro"`. |

### FeedbackContext (embedded, captured by the widget)

| Field | Type | Rules |
|-------|------|-------|
| `platform` | `Platform` | Required. |
| `pageUrl` | `string` | Required. Untrusted. Shown as its path (e.g. `/overview`); a link only if it parses as an `http:` or `https:` URL, otherwise plain text. |
| `browser` | `string` | e.g. `"Chrome 130"`. |
| `os` | `string` | e.g. `"macOS"`. |
| `screenWidth`, `screenHeight` | `number` | Shown as `{w} × {h}`. |

The context's "Tidspunkt" (time) is the ticket's `_creationTime`; it is not stored twice.

### Attachment (embedded)

| Field | Type | Rules |
|-------|------|-------|
| `kind` | `AttachmentKind` | Required. |
| `fileName` | `string` | Required. Untrusted; plain text. |
| `sizeBytes` | `number` | Required when `kind` is `"image"`; shown as e.g. `1,2 MB`. |
| `durationSeconds` | `number` | Required when `kind` is `"video"`; shown as e.g. `0:14`. |

Modeled as a discriminated union on `kind`, so an image cannot lack a size and a video cannot
lack a duration. No preview URL yet: previews show the placeholder from the design (image icon,
or play symbol for video). A storage URL is added together with Convex file storage.

### Reply (embedded)

| Field | Type | Rules |
|-------|------|-------|
| `text` | `string` | Non-empty after trimming. |
| `sentAt` | `number` (ms since epoch) | Time "Færdig/send" was used. |

## State transitions

```text
                 Opret GitHub-issue                 Færdig/send
   ┌──────┐  ─────────────────────────►  ┌─────────────┐  ───────────►  ┌──────┐
   │ open │                              │ in_progress │                │ done │
   └──────┘  ─────────────────────────────────────────────────────────► └──────┘
                              Færdig/send
```

| Action | Allowed when | Effect |
|--------|--------------|--------|
| Open ticket | always | `isRead = true` (stays true) |
| Færdig/send | `reply` is undefined and trimmed draft is non-empty | `reply = { text, sentAt: now }`, `status = "done"`, `completedAt = now` (spec 005) |
| Opret GitHub-issue | `githubIssueCreated === false` | `githubIssueCreated = true`; `status = "in_progress"` unless it is already `"done"` |

There is no transition back to `open`, and `done` is final in this feature.

## Badge rule (FR-005)

| Condition (checked in order) | Badge |
|------------------------------|-------|
| `isRead === false` | Ny (`.badge--new`) |
| `status === "in_progress"` | I gang (`.badge--progress`) |
| `status === "done"` | Færdig (`.badge--done`) |
| otherwise | none |

## Inbox UI state (client-only, not persisted)

> **Superseded by spec 002:** this state is now split into ticket data (shared via
> `TicketsProvider`, kept across pages) and the inbox view (local to `Inbox`, reset on remount).
> See [spec 002 data model](../002-side-menu/data-model.md#state-split-changes-the-inbox-from-spec-001).
>
> **Changed by spec 004 (2026-11-22):** the shared ticket data now lives in the Zustand store
> `lib/tickets/store.ts` instead of `TicketsProvider`. See
> [spec 004 data model](../004-zustand-ticket-store/data-model.md).

Held by the `Inbox` container (see [contracts/components.md](contracts/components.md)).

| Field | Type | Initial value |
|-------|------|---------------|
| `tickets` | `Feedback[]` | The mock data passed in as a prop |
| `statusFilter` | `"all" \| "done"` | `"all"` |
| `categoryFilter` | `"all" \| FeedbackCategory` | `"all"` |
| `sortOrder` | `"newest" \| "oldest"` | `"newest"` |
| `selectedId` | `string \| null` | `null` |
| `replyDraft` | `string` | Standard reply text; reset when another ticket is selected |
| `notice` | `"reply-sent" \| "issue-created" \| null` | `null`; cleared when another ticket is selected |

Derived values (pure functions, not stored):

- **Visible tickets**: `tickets` filtered by `categoryFilter`, then by `statusFilter`, sorted by
  `_creationTime` in `sortOrder`.
- **Counts**: `Alle` = tickets in the current category; `Færdig` = those with `status === "done"`.
- **Selected ticket**: the visible ticket whose `_id` equals `selectedId`; if a filter hides it,
  the panel shows its empty state (spec US3, scenario 5).

## Mock data (`apps/admin/lib/mock-feedback.ts`)

At least 15 tickets, with fixed timestamps, covering: all three categories, all three statuses,
both platforms, read and unread tickets, tickets with no, one and two attachments (including at
least one image and one video), one sender without a name, one ticket that already has a reply,
one `done` ticket without a reply, one description with line breaks, and one description and one
`pageUrl` containing markup or a `javascript:` address (to show FR-019 and the URL rule work).
