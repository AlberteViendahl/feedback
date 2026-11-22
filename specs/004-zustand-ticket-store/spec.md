# Feature Specification: Shared Ticket Store

**Feature Branch**: `zustand`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Replace the shared ticket data's React Context with a Zustand store, so components read shared state with provider wareppers. Nothing changes for the admin: menu counts, the inbox, moving between pages and reloading behave os today. Logging outc lears the session's ticket changes."

**Related specs**:

- [Spec 001](../001-feedback-inbox/spec.md) defines how tickets change: opening, replying and
  creating a GitHub issue.
- [Spec 002](../002-side-menu/spec.md) shares the tickets between the inbox and the side menu
  (FR-006), keeps ticket changes across admin pages (FR-017) and adds logging out (FR-013).
- [Spec 003](../003-search-top-bar/spec.md) adds the search, which belongs to the inbox view
  (FR-014, FR-015).

**Design reference**: None. No screen, text or layout is added or changed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Work with feedback exactly as before (Priority: P1)

An admin works through the inbox as they do today. They open tickets, reply, create GitHub issues
and move between the inbox, the platform pages and the settings. The side menu counts and the "Ny"
badges follow every change at once. Ticket changes are kept when the admin moves between pages,
and a reload starts over from the mock data. The admin cannot tell that anything has changed.

**Why this priority**: The change is only safe if nothing the admin relies on breaks. Every other
story depends on this one.

**Independent Test**: Run the acceptance checks from specs 001, 002 and 003 that involve tickets,
counts, moving between pages and reloading, and check that each one still gives the same result.

**Acceptance Scenarios**:

1. **Given** the inbox shows unread tickets, **When** the admin opens one, **Then** its "Ny" badge
   disappears and the side menu counts for its platform and for the workspace drop by one at once
   (spec 002, FR-006).
2. **Given** the admin has opened a ticket, sent a reply to it and created a GitHub issue for
   another ticket, **When** they go to "Indstillinger" and back to the inbox, **Then** the first
   ticket is still read, shows its reply and has the status "Færdig", and the second still shows
   its issue as created (spec 002, FR-017).
3. **Given** the inbox has a search, a filter and an open ticket, **When** the admin goes to a
   platform page and back, **Then** the inbox view is back to its defaults, while the ticket
   changes are kept (spec 002, FR-017; spec 003, FR-015).
4. **Given** the admin has changed tickets in this session, **When** they reload any admin page,
   **Then** the inbox and the side menu counts show the mock data as at first load.
5. **Given** the admin tries an action the rules do not allow (an empty reply, a second reply, or
   a second issue for the same ticket), **When** they try it, **Then** nothing changes, as today
   (spec 001).

---

### User Story 2 - Developers share ticket data without wrappers (Priority: P2)

A developer who works on the admin app needs to understand where ticket data comes from and to
test the parts that use it. Today every page and every test that needs ticket data must be placed
inside a component that supplies it, so the data comes from somewhere outside the code being read.
After the change, the parts that need ticket data read it from one shared place, and a test sets
up the tickets it needs in one step.

**Why this priority**: Code that is easier to read and test is the reason for this change. It
delivers no value to the admin directly, so it comes after User Story 1.

**Independent Test**: Read the admin layout and the tests that render the inbox or the side menu.
Check that none of them wraps the code under test in a component that supplies ticket data, and
that each test sets its tickets in one step.

**Acceptance Scenarios**:

1. **Given** the admin pages, **When** a developer reads how the inbox and the side menu get their
   tickets, **Then** both read them from the same shared place, and the admin layout does not wrap
   the pages in a component that supplies ticket data.
2. **Given** a test that renders the inbox or the side menu, **When** it needs particular tickets,
   **Then** it sets them in one step before rendering, with no wrapper around the code under test.
3. **Given** one test changes tickets (for example, opens one), **When** the next test runs,
   **Then** it starts from its own tickets and does not see the earlier test's changes.
4. **Given** the components that only display tickets (the ticket list, the detail panel and the
   side menu), **When** the change is done, **Then** they are unchanged and still receive their
   data from the code that connects them to it.

---

### User Story 3 - Logging out clears the session's ticket changes (Priority: P3)

An admin finishes their work and logs out. Whoever logs in next in that browser starts with a clean
inbox: tickets that were opened are unread again, and no reply or issue from the earlier session is
shown. Today the changes survive logging out, because the admin pages are kept hidden in the
browser instead of being closed.

**Why this priority**: It is the only change the admin can see, and it is small. The rest of the
feature works without it.

**Independent Test**: Open an unread ticket, send a reply to it and create a GitHub issue for
another ticket. Log out, click "Log ind igen", and check that every ticket and every menu count is
as at first load.

**Acceptance Scenarios**:

1. **Given** the admin has opened an unread ticket, **When** they click the log-out icon, **Then**
   the "Du er logget ud" page opens at once, as today. **When** they then click "Log ind igen",
   **Then** the ticket shows "Ny" again and the side menu counts are as at first load.
2. **Given** the admin has sent a reply and created a GitHub issue, **When** they log out and log
   back in, **Then** neither ticket shows a reply or a created issue, and both have the status they
   had at first load.
3. **Given** the admin has logged out, **When** they use the browser's Back button to return to an
   admin page, **Then** the page shows the tickets as at first load, not the changes made before
   logging out.
4. **Given** the admin has logged out and logged back in, **When** they open a ticket, **Then** it
   is marked as read and the counts drop by one, as in User Story 1.

---

### Edge Cases

- The admin moves between admin pages, including the platform pages, the settings page and the
  admin "page not found" page: no ticket change is lost. Only logging out or reloading clears them.
- The admin logs out with a search, a filter, an open ticket or an unsent reply draft in the inbox:
  after logging back in, the inbox view is at its defaults too.
- The admin opens or reloads the "Du er logget ud" page directly by its address: it shows the same
  page as before. The admin pages show the mock data as at first load, as after any reload. Opening
  the page does not log anyone in or out by itself (spec 002).
- The admin has two browser tabs open: each tab keeps its own ticket changes, as today. Logging out
  in one tab does not change the other.
- The admin logs out from the menu panel on a small screen: the result is the same as on a desktop.
- The admin logs out without having changed anything: logging back in shows the same tickets as
  before.

## Requirements *(mandatory)*

### Functional Requirements

**Behaviour kept from earlier specs**

- **FR-001**: Every ticket rule from specs 001 to 003 MUST stay as it is:
  - Opening a ticket marks it as read.
  - Sending a reply stores it and marks the ticket "Færdig". Empty replies and second replies are
    not allowed.
  - Creating a GitHub issue marks it as created and, unless the ticket is "Færdig", sets it to "I
    gang". A second issue for the same ticket is not allowed.
  - Searching changes no ticket.
- **FR-002**: The side menu counts and the inbox's "Ny" badges MUST update at once after every
  change and always agree (spec 002, FR-006).
- **FR-003**: Ticket changes MUST be kept while the admin moves between admin pages in the same
  session. The inbox view (search, filters, sort order, open ticket, reply draft) MUST return to
  its defaults when the admin comes back to the inbox (spec 002, FR-017; spec 003, FR-015).
- **FR-004**: Reloading any page MUST start over from the mock data (spec 002, FR-017).
- **FR-005**: Apart from logging out (FR-008), no admin page may change in what it shows, its text,
  its layout or its keyboard behaviour.

**Shared ticket data**

- **FR-006**: The inbox and the side menu MUST read and change ticket data in one shared place. The
  admin pages MUST NOT need to be placed inside a component that supplies the ticket data.
- **FR-007**: Components that only display data MUST keep receiving it from the code that connects
  them to the data, as today (Constitution Principle V). Only that connecting code changes.

**Logging out**

- **FR-008**: Clicking the log-out icon MUST discard every ticket change made in the session: read
  tickets, replies, statuses and created GitHub issues. Afterwards, every admin page MUST show the
  tickets as at first load, whether the admin returns with "Log ind igen", the browser's Back
  button or the page's address.
- **FR-009**: Logging out MUST otherwise behave as in spec 002, FR-013. It happens at once, without
  a confirmation step, and opens the "Du er logget ud" page without the menu, whose "Log ind igen"
  button opens the workspace page.

**Testing**

- **FR-010**: A test MUST be able to set the tickets it needs in one step before rendering, without
  a wrapper around the code under test. Each test MUST start from its own tickets, unaffected by
  changes made in another test.
- **FR-011**: Every existing automated check that describes what the admin sees MUST still pass
  with the same expected result. Only the way a test sets up its ticket data may change. The one
  check that only makes sense for the current approach, an error when ticket data is used outside
  the component that supplies it, is removed along with that approach.

### Key Entities

- **Session ticket data**: The tickets in the current browser session, with each ticket's read
  state, status, reply and GitHub issue. It starts from the mock data on every page load, and the
  inbox and the side menu share it. It is kept across admin pages, and it is discarded by logging
  out or reloading.
- **Inbox view** (existing, unchanged): The search, filters, sort order, open ticket, reply draft
  and notice. It belongs to the inbox and resets when the admin leaves the inbox.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every existing automated check that describes what the admin sees still passes after
  the change, and none of its expected results is removed or loosened (100% of checks).
- **SC-002**: Every acceptance scenario of User Story 1 gives the same result before and after the
  change (100% of scenarios).
- **SC-003**: After logging out and logging back in, every ticket matches the mock data in read
  state, status, reply and GitHub issue, and every side menu count equals its value at first load
  (100% of tickets and counts).
- **SC-004**: No admin page and no test wraps the code that uses ticket data in a component that
  supplies it (0 wrappers). A test sets up its tickets in one step.
- **SC-005**: At 1440px and 834px wide, the inbox, a platform page and the settings page look the
  same before and after the change, with no differences in content, color, spacing or layout.

## Assumptions

- The description's "with provider wareppers" is read as "without provider wrappers". This matches
  the reason given for the change, that the code becomes easier to read when no wrappers are needed.
- This is a technical change. The approach named in the description, a Zustand store in place of
  React Context, and the reason for adding a new library (Constitution Principle IV) are recorded
  in the plan. This spec describes only what must hold.
- Only the shared ticket data moves. The inbox view and the side menu's open/closed state stay
  where they are, because each belongs to one component (spec 002, Clarifications, Session
  2026-11-17).
- Logging out stays simulated, as in spec 002, FR-013. There is no real session, and admin pages
  stay reachable by their address.
- Each browser tab is its own session, as today.
- Today, ticket changes survive logging out. Spec 002 (research R3) expected logging out to discard
  them. It does not, because the admin pages are kept hidden after navigation instead of being
  closed (spec 003, research R9). This spec makes the intended behaviour a requirement.
- The mock data stays the data source. Moving to Convex is out of scope. Once Convex arrives, the
  ticket data will most likely come from Convex instead of the shared place this spec introduces.
- The requirements in specs 001 to 003 do not change. Their technical documents that describe the
  current approach get short notes pointing to this spec, as spec 003 did for spec 002.
