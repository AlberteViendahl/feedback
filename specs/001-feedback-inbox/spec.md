# Feature Specification: Feedback Inbox

**Feature Branch**: `spec-kit`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Admin should have a feedback-inbox. At the top of the card you can filter between "All" or "Done". At the top you can sort between categories. The three categories should be bug, feature-idea or general-feedback. Under is a list with all the individual tickets where you can see a preveiew of the description, an icon representing the category, who sent it, which platform and files attached. If the ticket has not been clicked before it should also have a "new"-status. Clicking on a specific ticket makes it appear on the right side. The right side contains the full description, preview of the attachments, the context of the user, and a pre-filled text-field. The user can either click send or create-github issue. All data for now should be mock-data. Use screenshot of design for referance."

**Design reference**:

- Screenshot: [design/inbox.png](design/inbox.png)
- Figma: [Keep – eksamen, "Admin - Organic Growth"](https://www.figma.com/design/Tw9qt246dOOdNdSOMXx65z/Keep---eksamen?node-id=323-1675) (inbox component: node `323:1906`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan incoming feedback (Priority: P1)

An admin opens the feedback inbox and sees every feedback ticket in a list. Each row tells them
at a glance what kind of feedback it is, a preview of what the user wrote, who sent it, from
which platform and page, whether files are attached, how long ago it arrived, and whether they
have opened it yet.

**Why this priority**: Seeing what has come in is the core value of the inbox. Without the list,
none of the other stories are possible.

**Independent Test**: Load the inbox with mock data and verify that every ticket appears as a row
with category icon, description preview, sender, platform, page, attachment count (when
present), time and status badge, matching the design reference.

**Acceptance Scenarios**:

1. **Given** the mock data contains tickets in all three categories, **When** the admin opens
   the inbox, **Then** every ticket is listed, newest first, each with the icon for its
   category (bug, feature idea or general feedback).
2. **Given** a ticket has a description longer than the row can show, **When** it is listed,
   **Then** the row shows the start of the description on one line, cut off with an ellipsis.
3. **Given** a ticket has two attached files, **When** it is listed, **Then** the row shows an
   attachment indicator with the number 2; a ticket without files shows no indicator.
4. **Given** a ticket has never been opened, **When** it is listed, **Then** it shows a "New"
   badge.

---

### User Story 2 - Read a ticket in full (Priority: P1)

The admin clicks a ticket in the list. The ticket is highlighted in the list and its full
details appear in the panel on the right: category and ticket number, the sender's name, email,
company and plan, when it was sent, the full description, previews of attached files, and the
context captured automatically when the feedback was sent.

**Why this priority**: Admins cannot act on feedback they cannot read in full. Together with
User Story 1 this is the minimum useful inbox.

**Independent Test**: Click any ticket and verify the right panel shows all its details, the row
is highlighted, and the "New" badge is gone from that row.

**Acceptance Scenarios**:

1. **Given** the inbox is open and no ticket is selected, **When** the admin clicks a ticket,
   **Then** the ticket's details appear in the right panel and the row is marked as selected.
2. **Given** a ticket shows a "New" badge, **When** the admin clicks it, **Then** the "New"
   badge is removed from that ticket and does not return when another ticket is selected.
3. **Given** a ticket has an image and a video attached, **When** it is opened, **Then** the
   panel lists both files with a preview, file name, and size (image) or duration (video), and
   the video preview shows a play symbol.
4. **Given** a ticket is open, **When** the admin looks at the context section, **Then** it
   shows platform, page, user (email and user ID), browser and operating system, screen size
   and time sent.
5. **Given** a ticket's description contains text that looks like HTML or script code,
   **When** it is shown in the list or the panel, **Then** that text is displayed literally as
   typed and is never interpreted.

---

### User Story 3 - Narrow down and order the list (Priority: P2)

The admin switches between "All" and "Done" tickets, filters by category (all, bug, feature idea,
general feedback), and switches the order between newest first and oldest first. The counts on
the All/Done switch show how many tickets each option contains.

**Why this priority**: Useful once the inbox has many tickets, but the inbox already delivers
value without it.

**Independent Test**: With mock data covering all categories and statuses, apply each filter and
sort option and verify the list contains exactly the expected tickets in the expected order.

**Acceptance Scenarios**:

1. **Given** the inbox shows all tickets, **When** the admin selects "Done", **Then** only
   tickets with status Done are listed.
2. **Given** the category filter is "All", **When** the admin selects "Bug", **Then** only bug
   tickets are listed, and the All/Done filter still applies on top.
3. **Given** the list is sorted newest first, **When** the admin switches to oldest first,
   **Then** the list is reversed by time sent.
4. **Given** a category is selected, **When** the admin looks at the All/Done switch, **Then**
   the counts reflect only tickets in that category.
5. **Given** a ticket is open in the right panel, **When** a filter hides it from the list,
   **Then** the right panel returns to its empty state.

---

### User Story 4 - Reply to the user or escalate to GitHub (Priority: P2)

Below the ticket details is a reply field pre-filled with a standard reply that the admin can
edit. The admin either sends the reply to the user, or creates a GitHub issue from the ticket.

**Why this priority**: Closing the loop with the user is the goal of the workflow, but with mock
data the actions are simulated, so the reading and triage stories come first.

**Independent Test**: Open a ticket, edit the pre-filled reply, use each action and verify the
confirmation and the resulting ticket status.

**Acceptance Scenarios**:

1. **Given** a ticket is open, **When** the admin looks at the reply field, **Then** it contains
   the standard reply text and can be edited.
2. **Given** the admin has edited the reply, **When** they choose "send", **Then** a confirmation
   is shown, the ticket's status becomes Done, and the Done count increases by one.
3. **Given** an open ticket that is not Done, **When** the admin chooses "create GitHub issue",
   **Then** a confirmation is shown, the ticket's status becomes In progress, and the action is
   no longer available for that ticket.
4. **Given** the reply field is empty or only whitespace, **When** the admin tries to send,
   **Then** sending is not possible.
5. **Given** a ticket in status In progress, **When** the admin sends a reply, **Then** its
   status becomes Done.

---

### Edge Cases

- No tickets match the current filters: the list shows an empty-state message instead of rows,
  and the right panel shows its empty state.
- No ticket is selected (e.g. on first load): the right panel shows a short prompt to select a
  ticket.
- A ticket has no attachments: the attachments section in the panel is hidden.
- A ticket's sender has no name: the sender's email is shown in place of the name.
- Very long single words or URLs in a description: they wrap or are cut off without breaking the
  layout.
- A page address in the context is not a normal web address (e.g. contains a script scheme): it
  is shown as plain text and is not clickable.
- The admin switches to another ticket after editing the reply: the edited text is discarded and
  the new ticket shows the standard reply.
- The admin creates a GitHub issue for a ticket that is already Done: a confirmation is shown,
  but the status stays Done.
- The "Done" filter is active and the admin sends a reply on a ticket: the ticket now matches
  the filter and appears in the list.

## Requirements *(mandatory)*

### Functional Requirements

**Inbox list**

- **FR-001**: The inbox MUST list all feedback tickets from the mock data source.
- **FR-002**: Each row MUST show: an icon for the ticket's category, the start of the
  description on one line (cut off with an ellipsis if too long), the sender's email, the
  platform, the page the feedback was sent from, the time since it was sent (e.g. "2 min
  siden", "I går", or a date for older tickets), and a status badge.
- **FR-003**: Rows for tickets with one or more attachments MUST show an attachment indicator
  with the number of files.
- **FR-004**: The three categories MUST be Bug, Feature idea and General feedback, each with its
  own icon and color as in the design reference.
- **FR-005**: A ticket that has not been opened MUST show a "New" badge. Once opened it MUST
  show its workflow status instead: "In progress" or "Done" badge, or no badge if neither.
- **FR-006**: The currently opened ticket MUST be visibly highlighted in the list.
- **FR-007**: The inbox MUST NOT show the "1 new feedback just arrived" banner from the design
  reference in this feature. The list starts directly with the ticket rows; the banner is added
  together with the real backend, when new tickets can actually arrive.

**Filtering and sorting**

- **FR-008**: Admins MUST be able to switch the list between "All" tickets and "Done" tickets.
  Each option MUST show its ticket count.
- **FR-009**: Admins MUST be able to filter by category: All, Bug, Feature idea or General
  feedback. The category filter and the All/Done filter MUST apply together.
- **FR-010**: Admins MUST be able to sort by time sent, newest first (default) or oldest first.

**Ticket details**

- **FR-011**: Clicking a ticket MUST open it in the right panel and mark it as opened.
- **FR-012**: The panel header MUST show the category label with its icon and the ticket number
  (e.g. "#FB-1042").
- **FR-013**: The panel MUST show the sender's initial (as an avatar), name, email, company,
  plan and the date and time the feedback was sent.
- **FR-014**: The panel MUST show the full description, preserving the sender's line breaks.
- **FR-015**: The panel MUST show the number of attachments and a preview card per file with
  its name and size (images) or duration (videos); video previews MUST show a play symbol.
- **FR-016**: The panel MUST show the automatically captured context: platform, page, user email
  and user ID, browser and operating system, screen size and time sent. The page MUST open the
  reported page in a new tab when it is a normal web address (http/https); otherwise it is shown
  as plain text.

**Reply and actions**

- **FR-017**: The panel MUST contain an editable reply field, pre-filled with the standard reply
  ("Din oplevelse er vigtig for os. Vi samler alle beskederne sammen, så vi kan gøre hjemmesiden
  endnu bedre."), and a "send" action. Sending MUST be unavailable while the field is empty.
  Sending is simulated (no message reaches the user); it MUST show a confirmation and set the
  ticket's status to Done.
- **FR-018**: The panel MUST contain a "create GitHub issue" action. It is simulated (no real
  GitHub issue is created); it MUST show a confirmation and set the ticket's status to In
  progress, unless the ticket is already Done, in which case the status stays Done. Each ticket
  can have at most one issue: once created, the action is unavailable for that ticket.
- **FR-022**: Status changes from FR-017 and FR-018 MUST be reflected immediately in the
  ticket's badge, the All/Done counts and the Done filter.

**Content safety and language**

- **FR-019**: All content written by feedback senders (description, names, emails, file names,
  page addresses, context values) MUST be displayed as plain text; markup in it MUST appear
  literally and never be interpreted.
- **FR-020**: All interface text MUST be in Danish, including labels shown in English in the
  design reference (e.g. "All", "Done", "New", "In progress", "Newest first").
- **FR-021**: The visual design (colors, spacing, typography, radii) MUST match the design
  reference and use only the project's existing design tokens.

### Key Entities

- **Feedback ticket**: One piece of feedback. Has a ticket number (e.g. FB-1042), category (bug,
  feature idea, general feedback), full description, time sent, workflow status (open, in
  progress, done), whether it has been opened by an admin, whether a GitHub issue has been
  created for it, a sender, the context it was sent in, and zero or more attachments.
- **Sender**: The person who sent the feedback. Has name (optional), email, user ID, company and
  plan (e.g. "Pro plan").
- **Attachment**: A file sent with the feedback. Has file name, type (image or video), size for
  images or duration for videos, and a preview.
- **Context**: Information captured automatically when the feedback was sent: platform
  (GEOtracking or SimpleSERP), page, browser and operating system, screen size and time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can open any ticket's full details with a single click from the list.
- **SC-002**: In a side-by-side review with the design reference, the inbox shows no differences
  in color, spacing, typography or layout beyond the agreed Danish wording.
- **SC-003**: For every filter, category and sort combination, the list contains exactly the
  expected tickets in the expected order (verified against the mock data in 100% of checks).
- **SC-004**: 100% of unopened tickets show the "New" badge and 0% of opened tickets do.
- **SC-005**: Filtering, sorting and opening a ticket update the screen without any noticeable
  delay (under 0.5 seconds) with the full mock data set.
- **SC-006**: In 100% of tests, feedback content containing markup or script code is shown
  literally and never executed.
- **SC-007**: An admin can go from opening a ticket to sending the reply in 2 clicks when
  keeping the standard reply.

## Assumptions

- Only the inbox card and the ticket detail panel are in scope. The sidebar, top search bar,
  page heading and key-figure cards shown elsewhere in the Figma frame are separate features,
  and so is the "new feedback just arrived" banner (FR-007).
- All data comes from mock data that covers all three categories, all workflow statuses, both
  platforms, tickets with and without attachments (including an image and a video), and both
  opened and unopened tickets. Counts are calculated from the mock data, not hard-coded.
- Opened state and status changes last only for the current session; reloading the page
  restores the mock data. Persistence comes with the real backend.
- No ticket is selected when the inbox first loads.
- Attachment previews are display-only in this feature; opening or playing a file in full size
  is out of scope.
- Sending a reply and creating a GitHub issue are simulated: no email is sent and no GitHub
  issue is created.
- The standard reply is the same for all categories.
- Admin authentication and permissions are out of scope; anyone who can open the admin app can
  use the inbox.
- The design is for desktop screens; small-screen layouts are out of scope for this feature.
