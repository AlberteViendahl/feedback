# UI Contracts: Feedback Inbox

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

The inbox has no API of its own; its interfaces are the props of its components and the pure
functions they share. These signatures are what tests target and what must stay stable when
mock data is replaced by Convex queries (Constitution V). Types refer to
`apps/admin/lib/types.ts`.

## Data entry point

```ts
// apps/admin/app/page.tsx (Server Component)
// The ONLY place that knows where tickets come from. Today: mock data. Later: Convex.
<FeedbackInbox initialTickets={mockFeedback} />
```

## Components (`apps/admin/components/feedback-inbox/`)

Only `FeedbackInbox` holds state. Every other component is presentational: it renders its props
and reports user actions through callbacks.

```ts
// FeedbackInbox.tsx  —  "use client"; owns InboxState (see data-model.md)
type FeedbackInboxProps = { initialTickets: Feedback[] }

// InboxToolbar.tsx  —  All/Done switch, category <select>, sort toggle
type InboxToolbarProps = {
  statusFilter: "all" | "done"
  categoryFilter: "all" | FeedbackCategory
  sortOrder: "newest" | "oldest"
  counts: { all: number; done: number }
  onStatusFilterChange: (value: "all" | "done") => void
  onCategoryFilterChange: (value: "all" | FeedbackCategory) => void
  onSortOrderChange: (value: "newest" | "oldest") => void
}

// TicketList.tsx  —  scrollable list, or the empty-state message when tickets is empty
type TicketListProps = {
  tickets: Feedback[]
  selectedId: string | null
  now: number | null            // null before hydration → absolute dates
  onSelect: (id: string) => void
}

// TicketRow.tsx  —  one <button> row
type TicketRowProps = {
  ticket: Feedback
  isSelected: boolean
  now: number | null
  onSelect: (id: string) => void
}

// TicketDetail.tsx  —  right panel; empty-state prompt when ticket is null
type TicketDetailProps = {
  ticket: Feedback | null
  replyDraft: string
  notice: "reply-sent" | "issue-created" | null
  onReplyDraftChange: (text: string) => void
  onSendReply: () => void
  onCreateIssue: () => void
}

// Sub-parts of the panel, each presentational:
type AttachmentListProps = { attachments: Attachment[] }        // hidden when empty
type ContextTableProps = { context: FeedbackContext; sentAt: number }
type ReplySectionProps = {
  reply: Reply | undefined       // set → read-only sent reply; undefined → form
  replyDraft: string
  githubIssueCreated: boolean    // true → "Opret GitHub-issue" unavailable
  notice: "reply-sent" | "issue-created" | null
  onReplyDraftChange: (text: string) => void
  onSendReply: () => void        // only callable when replyDraft.trim() !== ""
  onCreateIssue: () => void
}

// Small shared pieces:
type CategoryIconProps = { category: FeedbackCategory }          // 31 px Figma SVG + alt text
type StatusBadgeProps = { ticket: Pick<Feedback, "isRead" | "status"> } // badge rule in data-model.md
```

### Rendering rules every component must follow

- User-supplied strings (description, names, emails, file names, page URLs, context values) are
  rendered only as React text children. No `dangerouslySetInnerHTML` (Constitution III).
- Links built from `context.pageUrl` use `href` only when `isSafeHttpUrl(pageUrl)` is true, with
  `target="_blank"` and `rel="noopener noreferrer"`.
- Interactive elements are native `<button>`, `<select>` and `<textarea>` elements (FR-024).
- Styling uses classes and tokens from `apps/admin/app/globals.css` only (Constitution I).

## Pure functions (`apps/admin/lib/inbox/`)

```ts
// state.ts
type InboxAction =
  | { type: "select"; id: string }
  | { type: "setStatusFilter"; value: "all" | "done" }
  | { type: "setCategoryFilter"; value: "all" | FeedbackCategory }
  | { type: "setSortOrder"; value: "newest" | "oldest" }
  | { type: "editReply"; text: string }
  | { type: "sendReply"; now: number }      // no-op if reply exists or draft is blank
  | { type: "createIssue" }                 // no-op if githubIssueCreated
function createInitialState(tickets: Feedback[]): InboxState
function inboxReducer(state: InboxState, action: InboxAction): InboxState

// select.ts
function getVisibleTickets(state: InboxState): Feedback[]
function getCounts(tickets: Feedback[], category: "all" | FeedbackCategory): { all: number; done: number }
function getSelectedTicket(state: InboxState): Feedback | null   // null if hidden by filters

// format.ts  (da-DK, timeZone Europe/Copenhagen — see research.md R3)
function formatRelativeTime(sentAt: number, now: number): string
function formatShortDate(sentAt: number): string                  // fallback while now is null
function formatDateTime(timestamp: number): string                // "28. okt. 2026, 11.42"
function formatTicketNumber(n: number): string                    // "#FB-1042"
function formatFileSize(bytes: number): string                    // "1,2 MB"
function formatDuration(seconds: number): string                  // "0:14"
function getPagePath(pageUrl: string): string                     // "/overview", or the raw string

// safe-url.ts
function isSafeHttpUrl(value: string): boolean                    // true only for http: / https:

// use-now.ts  —  "use client"
function useNow(): number | null   // null on server and first hydration pass; minute-rounded ms after
```
