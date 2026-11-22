# Quickstart: Validate the Shared Ticket Store

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to prove the change works and that nothing else changed. The details are in
[data-model.md](data-model.md) and [contracts/components.md](contracts/components.md).

## 0. Before changing any code: take baseline screenshots (SC-005)

On the current code, with `npm run dev` running in `apps/admin`, take a screenshot of each of
these pages at 1440px and at 834px wide:

- `/` (the inbox)
- `/platforms/geotracking`
- `/settings`

Keep the screenshots outside the repository. They are compared with the same pages after the
change in section 4.

**Done 2026-11-22** by the user, by hand, at 2× pixel density, with the browser window cropped:

```text
~/Documents/Projects/feedback-screenshots/004-zustand/before/
├── home-page-inbox/{1440px,834px}.png    # /
├── platforms/{1440px,834px}.png          # /platforms/geotracking
└── settings/{1440px,834px}.png           # /settings
```

They show the first load: "4 nye" for Organic Growth, "3 nye" for GEOtracking and "1 ny" for
SimpleSERP. The Next.js development badge in a corner is not part of the app.

## 1. Automated checks (Constitution quality gate)

From `apps/admin`:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

All four must pass. Compared with before the change, the test count changes like this:

- **Removed**: the 3 `TicketsProvider` tests.
- **Added**: the store tests, the `ResetTickets` tests, one logged-out page test and one
  integration test.
- **Unchanged**: every other test keeps its assertions. Only its setup changes (FR-011, SC-001).

| Area | What the tests prove | Spec reference |
|------|----------------------|----------------|
| `lib/tickets/store` | starts with the mock data; each action follows the ticket rules; a disallowed action changes nothing; `resetTickets` restores the mock data | FR-001, FR-008 |
| `ResetTickets` | renders nothing; clears the ticket changes when shown, and again after being hidden and shown | FR-008, US3 |
| Logged-out page | the page clears the ticket changes; heading, link and "no menu" checks unchanged | FR-008, FR-009 |
| Side menu + inbox together | counts follow opened tickets; changes survive an inbox remount; after `ResetTickets`, counts and "Ny" badges are back | FR-002, FR-003, US3-1 |
| Inbox, keyboard, `SideMenuContainer` | unchanged assertions with tickets set in one line before rendering | FR-005, FR-010 |
| Every test | starts from the mock data, whatever the test before it did | FR-010, US2-3 |

## 2. Code checks

From the repository root:

```bash
# No provider is left (SC-004). Expect no matches.
grep -rnw "TicketsProvider\|useTickets\|createContext" apps/admin --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.next

# The mock tickets enter in one place. Expect apps/admin/lib/tickets/store.ts (and its test).
grep -rln "mock-feedback" apps/admin --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.next

# Only client code imports the store. Expect the two containers, ResetTickets, vitest.setup.ts
# and tests. (Match the import, not the path: two comments in app/(admin) mention the file.)
grep -rln 'from "@/lib/tickets/store"' apps/admin --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.next
```

Also check that `apps/admin/package.json` lists `"zustand": "5.1.0"` under `dependencies` and
that `package-lock.json` is updated.

## 3. Manual checks in the running app

```bash
cd apps/admin
npm run dev
```

Open <http://localhost:3000/>. At first load, the side menu shows "4 nye" next to Organic Growth.
If styles look stale, change the CSS file's contents rather than `touch`ing it, or restart
`next dev`.

| Steps | Expected | Checks |
|-------|----------|--------|
| Open an unread ticket | Its "Ny" badge disappears, and its platform's count and Organic Growth's count drop by one at once | US1-1, FR-002 |
| Send a reply to it. Open another ticket and create a GitHub issue. Go to "Indstillinger", then back to the inbox | Both changes are still shown. The inbox view (filters, search, open ticket) is at its defaults | US1-2, US1-3, FR-003 |
| Reload the page | Every ticket and count is as at first load ("4 nye") | US1-4, FR-004 |
| Make the same changes, click "Log ud", then "Log ind igen" | The logged-out page looks as before. Back in the inbox, every ticket and count is as at first load | US3-1, US3-2, FR-008, FR-009 |
| Make a change, click "Log ud", then press the browser's Back button | The admin page shows the tickets as at first load | US3-3 |
| Then press Forward, then Back again | Still as at first load | FR-008 |
| After logging back in, open an unread ticket | It is marked as read and the counts drop by one | US3-4 |
| Open the app in two tabs and change a ticket in one | The other tab is unchanged. Logging out in one tab leaves the other's changes | Edge cases |
| At 834px wide, open the menu and click "Log ud" | Same result as on a desktop, and the menu is closed when you return | Edge case |

The hidden admin pages stay in the DOM with `display: none` while `/logged-out` is shown (spec
003, research R9). Browser scripts must check visibility, not presence.

## 4. Visual comparison (SC-005)

Take the screenshots from section 0 again on the changed code, with the same widths and pages.
Save them in `~/Documents/Projects/feedback-screenshots/004-zustand/after/`, with the same folder
and file names as `before/`. Compare them in pairs.

- **Expected**: no differences in content, colour, spacing or layout.
- **Allowed**:
  - a few pixels' difference in image size, because the "before" set was cropped by hand
  - the Next.js development badge
