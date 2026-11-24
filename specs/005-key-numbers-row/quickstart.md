# Quickstart: Key Numbers Row

## Prerequisites

- `apps/admin` dependencies installed (`npm install` at the repo root).
- The three new icon SVGs (inbox tray, progress, check) exported from Figma to
  `~/Documents/feedback-icons` ([research R6](research.md#r6-icons-and-colours)).

## Automated checks

From `apps/admin`:

```sh
npx vitest run lib/tickets components/inbox
npm run lint
npx tsc --noEmit
```

Expected:

- `getKeyNumbers` tests cover every rule in [data-model.md](data-model.md), with a fixed `now`:
  unopened vs opened tickets, done 29/30/31 days ago, bugs on Sunday 23:30 vs Monday 00:00,
  change up/down/zero, and `now === null`.
- `ticketsReducer` test: `sendReply` sets `completedAt` to `now`.
- `KeyNumbers` tests: order, Danish labels, "–" for `null`, thousands separator, change text for
  screen readers, no focusable elements.
- `Inbox` test: opening a new ticket moves one from the first card to the second; Done/send moves
  one from the second card to the third.

## Manual check

1. Restart `npm run dev` (a running server may keep serving old global CSS) and open `/`.
2. Four cards above the filters: blue, yellow, green, red, matching
   [design/key-numbers.png](design/key-numbers.png).
3. Open an unread ticket: the first card goes down by one and the second up by one, at the same
   moment as the side menu's count.
4. Press Tab from the search field: focus skips the cards.
5. Narrow the window below the tablet breakpoint: the cards keep their width and the row scrolls
   sideways, as in [design/tablet.png](design/tablet.png).
6. Type in search or change filters: the numbers do not change.
