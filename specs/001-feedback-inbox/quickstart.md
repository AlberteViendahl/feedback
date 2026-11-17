# Quickstart: Validate the Feedback Inbox

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to prove the feature works once it is implemented. Details of the data and components are in
[data-model.md](data-model.md) and [contracts/components.md](contracts/components.md).

## Prerequisites

- Node 24 and npm 11 (the versions the plan was checked against)
- Dependencies installed in the admin app:

  ```bash
  cd apps/admin
  npm install
  ```

## 1. Automated checks (Constitution quality gate)

Run from `apps/admin`. All three must pass.

```bash
npm run lint
npx tsc --noEmit
npx vitest run
```

Expected: no lint errors, no type errors, all tests green. The test suite covers at least:

| Area | What the tests prove | Spec reference |
|------|----------------------|----------------|
| `lib/inbox/state` | select marks read and resets draft; send sets reply + Done; send blocked when draft blank or reply exists; issue sets In progress (Done stays Done); issue only once | FR-011, FR-017, FR-018, FR-022 |
| `lib/inbox/select` | every status × category × sort combination returns the expected tickets; counts follow the category; hidden selection returns `null` | FR-008–FR-010, SC-003 |
| `lib/inbox/format` | relative-time table from research R3 with a fixed `now`; Danish dates; size, duration, ticket number, page path | FR-002, FR-013, FR-015, FR-016 |
| `lib/inbox/use-now` | minute-rounded time in the browser, `null` on the server, updates every minute, timer cleared on unmount | FR-002, research R2 |
| `lib/inbox/safe-url` | `http:`/`https:` accepted; `javascript:`, `data:`, relative and malformed values rejected | FR-016 |
| Components | rows show icon, preview, sender, platform, page, attachment count, badge; markup in a description renders as literal text; empty states; sent reply shown read-only | US1, US2, FR-019, SC-006 |
| Keyboard | Tab reaches rows, switch, filter, sort, textarea and actions; Enter/Space opens a ticket and triggers actions | FR-024, SC-008 |

## 2. Run the app

```bash
cd apps/admin
npm run dev
```

Open http://localhost:3000. Then walk through these checks.

### Scan the list (User Story 1)

1. The inbox card has the height of the design; the list starts directly with ticket rows (no
   "new feedback" banner, FR-007).
2. Rows are sorted newest first and each shows category icon, one-line description preview,
   email · platform · page, time, badge, and a paperclip count when files are attached.
3. Unread tickets show **Ny**. Scroll the list: only the list moves (FR-023).

### Read a ticket (User Story 2)

1. Click a row marked **Ny**: the row is highlighted, the badge disappears, and the right panel
   shows category chip, `#FB-…`, sender, description, attachments and the context table.
2. Open the ticket whose description contains markup (e.g. `<b>`): it appears as literal text.
3. Open the ticket whose page address is a `javascript:` URL: the page shows as plain text, not
   a link.

### Filter and sort (User Story 3)

1. Choose **Færdig**: only done tickets remain; the count matches.
2. Choose **Kategori: Fejl**: only Fejl tickets; both counts update.
3. Toggle **Nyeste først** → **Ældste først**: the order reverses.
4. With a ticket open, pick a filter that hides it: the panel returns to its empty prompt.

### Reply and escalate (User Story 4)

1. Open a ticket without a reply: the field holds the standard reply.
2. Clear the field: **Færdig/send** is disabled. Type text and send: confirmation appears, the
   field is replaced by the sent text and time, the badge shows **Færdig**, the Færdig count
   rises by one.
3. On another open ticket choose **Opret GitHub-issue**: confirmation appears, the badge shows
   **I gang**, the button is no longer available.

### Keyboard only (FR-024)

Put the mouse aside. Using Tab, Shift+Tab, Enter and Space, repeat one check from each section
above. Every focused element shows a visible outline.

### Visual comparison (SC-002)

Compare the page side by side with [design/inbox.png](design/inbox.png) and Figma node
`323:1906`. Differences allowed: Danish wording and the missing banner.

## 3. Production build

```bash
cd apps/admin
npm run build
```

Expected: the build succeeds with no `blocking-prerender` errors (confirms the time handling in
research R2 works with Cache Components).
