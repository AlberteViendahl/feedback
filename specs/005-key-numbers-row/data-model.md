# Data Model: Key Numbers Row

## Feedback (changed)

Defined in `apps/admin/lib/types.ts` (Constitution II). One new field:

| Field | Type | Rule |
| ----- | ---- | ---- |
| `completedAt` | `number` (ms since epoch), optional | Set when the ticket becomes `done`. Absent on tickets that are not done. |

Fields the key numbers read: `isRead`, `status`, `completedAt`, `category`, `_creationTime`.

### State transitions

| Action | Change | Effect on key numbers |
| ------ | ------ | --------------------- |
| `markRead` (open a ticket) | `isRead: true` | new −1, in progress +1 (if not done) |
| `sendReply` (Done/send) | `status: "done"`, `reply.sentAt = now`, **`completedAt = now`** | in progress −1, done +1 |
| `createIssue` | `status: "in_progress"` unless done | none (already opened) |

Completing stays final: `sendReply` is refused for a ticket that already has a reply, so
`completedAt` is never overwritten.

### Mock data

Every mock ticket with `status: "done"` gets a `completedAt` after its `_creationTime`, including
the two done tickets without a reply.

## KeyNumbers (derived, never stored)

Returned by `getKeyNumbers(tickets, now)` in `apps/admin/lib/tickets/key-numbers.ts`.

| Field | Type | Rule |
| ----- | ---- | ---- |
| `newCount` | `number` | Tickets with `!isRead` (same rule as `getNewCounts`, FR-002) |
| `inProgressCount` | `number` | Tickets with `isRead && status !== "done"` (FR-003) |
| `doneLast30Days` | `number \| null` | `status === "done"` and `now - completedAt <= 30 days`; `null` when `now` is `null` (FR-004, research R2, R4) |
| `bugsThisWeek` | `number \| null` | `category === "bug"` and `_creationTime` in [Monday 00:00 local, now]; `null` when `now` is `null` (FR-005, R5) |
| `bugsChange` | `number \| null` | `bugsThisWeek − bugs last week` (Monday to Monday); `null` when `now` is `null` (FR-006) |

All counts cover the whole workspace; inbox search and filters are not inputs (FR-007).
