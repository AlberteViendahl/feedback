# Feature Specification: Key Numbers Row

**Feature Branch**: `priorities`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "When viewing the platform, there should be a row showing some key numbers. The row is to help the user get a quick overview of the tasks. The first item on this row shows all new tickets that have not been opened yet. The second shows all tickets that have been opened and in progress. A ticket is in progress if it has been opened. The third item shows tickets that have been completed within the last 30 days. The last item shows all tickets this week that are bugs. They are not to be clickable, they are only for getting a quick overview. Look at screenshots for reference."

**Related specs**:

- [Spec 001](../001-feedback-inbox/spec.md) defines the inbox, opening a ticket, and replying
  with Done/send, which completes a ticket.
- [Spec 002](../002-side-menu/spec.md) shares ticket changes between the inbox and the side menu,
  including the menu's "new" counts.
- [Spec 004](../004-zustand-ticket-store/spec.md) holds the shared ticket data the numbers are
  counted from.

**Design reference**:

- [design/desktop.png](design/desktop.png): full inbox on desktop; the row sits above the
  filters, four cards side by side.
- [design/tablet.png](design/tablet.png): inbox on tablet; the cards keep their size and the
  fourth card runs off the right edge.
- [design/key-numbers.png](design/key-numbers.png): the row on its own.

Each card has an icon in a small frame, a large number, and a short label under it. Colours from
left to right: blue/purple (new), yellow (in progress), green (done), red (bugs). The Figma text
is English; the product shows Danish text (constitution, Principle I).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See how much work is waiting (Priority: P1)

An admin opens the feedback inbox and, before reading any ticket, sees how many tickets nobody
has opened yet and how many are being worked on.

**Why this priority**: These two numbers answer the first question an admin has when arriving:
"how much is waiting for us?". They are the core of the row.

**Independent Test**: Load the inbox with known sample tickets and check that the first two
cards show the number of unopened tickets and the number of opened, not-completed tickets.

**Acceptance Scenarios**:

1. **Given** 5 tickets that have never been opened, **When** the admin views the inbox, **Then**
   the first card shows 5 with the label "Nye · ikke åbnet endnu".
2. **Given** 3 tickets that have been opened and are not completed, **When** the admin views the
   inbox, **Then** the second card shows 3 with the label "I gang".
3. **Given** a ticket that has been opened but nobody has done anything else with it, **When**
   the admin views the inbox, **Then** it counts as in progress, not as new.
4. **Given** the first card shows 5, **When** the admin opens one of the new tickets, **Then**
   the first card changes to 4 and the second card goes up by 1 straight away, without reloading.
5. **Given** an in-progress ticket, **When** the admin completes it with Done/send, **Then** the
   second card goes down by 1.

---

### User Story 2 - See recent output (Priority: P2)

An admin wants to see how many tickets the team has completed recently.

**Why this priority**: Useful for a sense of progress, but it does not drive what to do next.

**Independent Test**: Load the inbox with tickets completed at known times and check that the
third card counts only those completed within the last 30 days.

**Acceptance Scenarios**:

1. **Given** tickets completed 1, 10 and 29 days ago and one completed 45 days ago, **When** the
   admin views the inbox, **Then** the third card shows 3 with the label "Færdige · sidste 30
   dage".
2. **Given** the third card shows 3, **When** the admin completes another ticket with Done/send,
   **Then** the third card shows 4 straight away.

---

### User Story 3 - Spot a spike in bugs (Priority: P3)

An admin wants to know whether many bugs have come in this week and whether that is more or less
than last week.

**Why this priority**: An early warning for quality problems, but less urgent than the work
queue.

**Independent Test**: Load the inbox with bug and non-bug tickets sent at known times this week
and last week, and check the fourth card's number and its change against last week.

**Acceptance Scenarios**:

1. **Given** 7 bug tickets and 4 idea tickets sent this week, **When** the admin views the
   inbox, **Then** the fourth card shows 7 with the label "Fejl denne uge".
2. **Given** 7 bugs this week and 4 last week, **When** the admin views the inbox, **Then** the
   label also shows an upward change of 3 ("↑ 3").
3. **Given** 2 bugs this week and 5 last week, **When** the admin views the inbox, **Then** the
   label shows a downward change of 3 ("↓ 3").
4. **Given** the same number of bugs this week and last week, **When** the admin views the inbox,
   **Then** no change is shown.
5. **Given** a bug sent last Sunday and today is Monday, **When** the admin views the inbox,
   **Then** that bug is not counted in this week's number.

---

### User Story 4 - Numbers are information only (Priority: P3)

The cards only inform. Clicking them does nothing.

**Why this priority**: Avoids the admin expecting a filter that does not exist.

**Independent Test**: Click and tab through the row and confirm nothing happens and no card
receives focus.

**Acceptance Scenarios**:

1. **Given** the inbox, **When** the admin clicks a card, **Then** the list, filters and open
   ticket stay exactly as they were.
2. **Given** a keyboard user tabbing through the page, **When** they pass the row, **Then** no
   card takes focus.
3. **Given** a screen reader user, **When** they reach the row, **Then** each card is read as its
   number together with its label (e.g. "12 Nye · ikke åbnet endnu").

---

### Edge Cases

- No tickets at all: every card shows 0, the row is still shown, and the bug card shows no
  change.
- Search, the category filter, the All/Done toggle and sort order do not change the numbers; the
  row always counts every ticket in the workspace.
- Narrow screens: the cards keep their size and the row scrolls sideways instead of squeezing or
  wrapping, as in the tablet design.
- Large numbers (1 000 or more) still fit on the card without breaking the layout.
- Week boundaries follow the admin's local time, so a bug sent at 23:30 on Sunday belongs to the
  week that is ending.
- A ticket completed exactly 30 days ago, to the minute, is still counted; one completed earlier
  than that is not.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The inbox MUST show a row of four key-number cards above the filters, in this
  order: new, in progress, done in the last 30 days, bugs this week.
- **FR-002**: The "new" card MUST count tickets that have never been opened, using the same rule
  as the side menu's "new" count, so the two always agree.
- **FR-003**: The "in progress" card MUST count tickets that have been opened and are not
  completed. Opening a ticket is enough to count it as in progress.
- **FR-004**: The "done" card MUST count tickets completed within the last 30 days, counted back
  from the moment the page is viewed.
- **FR-005**: The "bugs this week" card MUST count tickets with the category bug sent during the
  current week, from Monday 00:00 up to now, in the admin's local time.
- **FR-006**: The "bugs this week" card MUST show the change against the number of bugs sent last
  week (Monday to Sunday), as an up or down arrow with the size of the difference, and show no
  change when the two are equal.
- **FR-007**: The row MUST count every ticket in the admin's workspace across all its platforms;
  search, filters and sort order in the inbox MUST NOT affect the numbers.
- **FR-008**: The numbers MUST update immediately when a ticket is opened or completed, without
  reloading the page.
- **FR-009**: The cards MUST NOT be clickable or focusable and MUST NOT look interactive on hover.
- **FR-010**: Each card MUST be read by screen readers as its number followed by its label.
- **FR-011**: Labels MUST be in Danish: "Nye · ikke åbnet endnu", "I gang", "Færdige · sidste 30
  dage", "Fejl denne uge".
- **FR-012**: Each card MUST use the colour, icon and layout of the matching card in the design
  reference; on screens too narrow for all four cards, the row MUST scroll sideways with the
  cards kept at full size.
- **FR-013**: The system MUST record when a ticket is completed, so the "done" card can count by
  completion time.

### Key Entities

- **Ticket (feedback)**: Already exists. Relevant attributes: whether it has been opened, whether
  it is completed and when, its category, and when it was sent. This feature adds the completion
  time.
- **Key number**: A count shown on a card, with its label and, for bugs, the change against last
  week. Always worked out from the tickets; never stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can tell how many tickets are new and in progress within 3 seconds of
  opening the inbox, without scrolling or clicking.
- **SC-002**: For any set of sample tickets, all four numbers match a manual count using the
  rules in FR-002 to FR-006, with 0 differences.
- **SC-003**: After opening or completing a ticket, the affected numbers change at the same moment
  as the ticket's own badge.
- **SC-004**: No click or key press on the row changes anything on the page.
- **SC-005**: The row matches the design reference in colours, icons, order and spacing at desktop
  and tablet widths.

## Assumptions

- "When viewing the platform" means the feedback inbox (the workspace overview at the top of the
  menu), which is what the design shows. The per-platform pages are placeholders and get no row
  in this feature.
- A ticket is completed when the admin sends a reply with Done/send (spec 001); its completion
  time is the moment the reply is sent. Sample tickets that are already completed get a plausible
  completion time so the "done" card can be tested.
- "This week" is the calendar week starting Monday, as is usual in Denmark, not the last 7 days.
- The arrow on the bug card compares with the whole of last week (Monday to Sunday); the design
  shows "↑ 3" next to "Bugs this week".
- Opening a ticket makes it count as in progress for the key numbers. Whether the ticket's status
  badge in the list should also change to "I gang" when opened is not part of this feature; the
  badge keeps its current rule.
- Data still comes from the existing sample tickets; no backend work is part of this feature.
