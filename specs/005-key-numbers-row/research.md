# Research: Key Numbers Row

All open points from the spec and the Technical Context are resolved below.

## R1. Where the numbers are counted

- **Decision**: A pure function `getKeyNumbers(tickets, now)` in `lib/tickets/key-numbers.ts`.
  `Inbox` already reads the tickets from the store and the clock from `useNow()`; it calls the
  function and passes the result to a new presentational component, `KeyNumbers`.
- **Rationale**: Constitution V: the component gets its data via props. Counting in one pure
  function makes every rule (FR-002 to FR-006) testable with Vitest alone, and the numbers
  update with the store automatically (FR-008). `lib/tickets/` already holds `getNewCounts`,
  the other workspace-wide count.
- **Alternatives considered**: Counting inside the component (breaks Principle V, harder to
  test); a selector in the store returning an object (the store comment warns that a selector
  building a new object re-renders forever).

## R2. The clock before hydration

- **Decision**: "Done" and "bugs this week" depend on the current time. While `useNow()` is
  `null` (pre-rendering and the first hydration pass), those two cards show "–" instead of a
  number, and the bug card shows no change. "New" and "in progress" do not need the clock and
  always show their number.
- **Rationale**: Cache Components forbids reading the clock while rendering (spec 001 research
  R2); the ticket list solves the same problem by showing absolute dates until the time is known.
  A dash is shown for a moment only, and never a wrong number.
- **Alternatives considered**: Use the mock data's fixed date as "now" (wrong once real data
  arrives); hide the cards until hydration (layout jump).

## R3. Recording when a ticket is completed (FR-013)

- **Decision**: Add an optional `completedAt: number` (milliseconds since epoch) to `Feedback` in
  `lib/types.ts`. `ticketsReducer`'s `sendReply` sets it to the same `now` it already uses for
  `reply.sentAt`. Every mock ticket with `status: "done"` gets a `completedAt`, including the two
  that have no reply.
- **Rationale**: Constitution II: the type mirrors the planned Convex schema, where completion
  time is its own field. `reply.sentAt` cannot be used, because sample tickets can be done without
  a reply, and later a ticket could be completed without one.
- **Alternatives considered**: Use `reply.sentAt` (misses done tickets without a reply); use
  `_creationTime` (counts when feedback arrived, not when it was handled).

## R4. "Last 30 days"

- **Decision**: A ticket counts when `status === "done"` and `now - completedAt <= 30 × 24 h`.
  A done ticket without `completedAt` is not counted.
- **Rationale**: Matches the spec's edge case (exactly 30 days ago still counts). A fixed length
  is simpler than calendar days and an hour's difference around daylight saving does not matter
  for an overview number.
- **Alternatives considered**: Calendar days in local time (more code, no visible gain).

## R5. "This week" and the change against last week

- **Decision**: The week starts Monday 00:00 in the browser's local time. The start is found with
  local `Date` methods (`getDay`, `setDate`, `setHours(0, 0, 0, 0)`), not by subtracting
  milliseconds, so daylight-saving weeks are right. This week is `[monday, now]`; last week is
  `[monday − 7 days, monday)`, again with `setDate`. Bugs are tickets with `category === "bug"`
  counted by `_creationTime`. The change is `thisWeek − lastWeek`: positive shows "↑ n", negative
  "↓ n", zero shows nothing.
- **Rationale**: Danish weeks start Monday (spec assumption). Local time matches what the admin
  sees in the ticket list's dates.
- **Alternatives considered**: Rolling 7 days (the label says "denne uge"); ISO week numbers via a
  date library (new dependency, Constitution IV).

## R6. Icons and colours

- **Decision**: Each card's icon is an inline SVG component in `components/Icons/`, sized by
  `icon-size` and coloured with `currentColor`, so it takes the card's `--stat-fg` colour.
  - Bugs: the existing `BugIcon`. Its fill changes from `#B80000` to `currentColor`.
    `.category-badge--bug` gets `color: var(--danger-fg)` (`#be3f59`, the bug colour in the
    original Figma category icon), and the bug chip in `TicketDetail` becomes dark like the
    surrounding text, as it was before the icon swap.
  - New (inbox tray), in progress (circle arc) and done (check mark): **new SVGs are needed from
    Figma**, exported to `~/Documents/feedback-icons` like the earlier icons, and turned into
    `InboxIcon`, `ProgressIcon` and `CheckIcon` the same way.
- **Rationale**: Constitution I: icons and colours come from Figma; the stat colours already
  exist as `--info-*`, `--warning-*`, `--success-*`, `--danger-*` tokens and `.stat-card--*`
  classes in `globals.css`, matching the design's blue, yellow, green and red.
- **Alternatives considered**: Keep `BugIcon` red and give the card a separately coloured copy
  (two bug icons for one shape).

## R7. Layout and styling

- **Decision**: Reuse the existing, so far unused, `.stat-card`, `.stat-card--info|warning|
  success|danger`, `.icon-frame` and `.text-stat` classes. Add a `.key-numbers` row class: on
  desktop a four-column grid with `--inbox-gap` between cards; below the `xl` breakpoint (where
  the inbox already switches to one column) a single row that scrolls sideways, with each card at
  a fixed width of 264px (from Figma, given by the product owner), added as the token
  `--stat-card-width`. Any other missing value is measured in Figma and added as a token
  (Constitution I). The row sits inside the inbox section, above the toolbar.
- **Rationale**: The classes were added with the design tokens and match the card in the design.
  Scrolling sideways follows the tablet frame (FR-012).
- **Alternatives considered**: Wrapping into two rows (not in the design); shrinking cards (labels
  would truncate).

## R8. Not interactive, but readable (FR-009, FR-010)

- **Decision**: The row is a `<ul aria-label="Nøgletal">` with one `<li>` per card; no buttons,
  links or `tabindex`. In each card the number comes before the label in the DOM, so screen
  readers read "12 Nye · ikke åbnet endnu". The bug change is shown as "↑ 3" with the arrow
  `aria-hidden` and a visually hidden text "3 flere end sidste uge" / "3 færre end sidste uge".
  No hover styles.
- **Rationale**: A list says "four items" to screen readers and is not focusable. The hidden text
  stops the arrow from being read as "upwards arrow".
- **Alternatives considered**: `role="status"` / live region (would announce every change while
  the admin works).

## R9. Number format

- **Decision**: Numbers use `Intl.NumberFormat("da-DK")`, so 1 000 or more gets a thousands
  separator; the card's number never wraps.
- **Rationale**: Danish UI (constitution); covers the large-number edge case.

## R10. Mock data and the real clock

- **Decision**: The mock tickets keep their fixed dates (mid-November 2026). With the real clock,
  "bugs this week" and "done" may show low numbers or 0. The numbers are checked in tests with a
  fixed `now`, not against the design's illustrative numbers.
- **Rationale**: The design's numbers are examples (12, 5, 48, 7), not a target; moving the mock
  dates would change every relative time in the list and its tests.
- **Alternatives considered**: Make mock dates relative to today (touches all mock-based tests).
