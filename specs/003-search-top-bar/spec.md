# Feature Specification: Search Top Bar

**Feature Branch**: `topbar`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "The component should be a topbar over the inbox-view. When writing in the input-field, it should filter the tickets based on the inoput.The width should be responsive with the width of the screen. Use attachements for design reference."

**Design reference**:

- The top bar itself: [design/top-bar.png](design/top-bar.png); Figma
  ["Topplinje"](https://www.figma.com/design/Tw9qt246dOOdNdSOMXx65z/Keep---eksamen?node-id=323-1707)
  (node `323:1707`, 1170 × 63; search field `323:1709`, 420 × 39)
- How it fits the page at 1440px: [../002-side-menu/design/page-workspace.png](../002-side-menu/design/page-workspace.png)
  (the same image as the attached "Admin - Organic Growth"); Figma frame
  ["Admin - Organic Growth"](https://www.figma.com/design/Tw9qt246dOOdNdSOMXx65z/Keep---eksamen?node-id=323-1675)
  (node `323:1675`)
- Tablet (834px), with the search field under the top bar that has the menu button:
  [../002-side-menu/design/page-tablet.png](../002-side-menu/design/page-tablet.png); Figma frame
  ["Admin - Organic Growth — Tablet"](https://www.figma.com/design/Tw9qt246dOOdNdSOMXx65z/Keep---eksamen?node-id=356-435)
  (node `356:435`). Mobile: Figma frame `356:379`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find feedback by typing (Priority: P1)

An admin is looking for one particular piece of feedback: from a customer who got in touch, about
a page, or about a topic. They type into the search field at the top of the inbox. With every
character, the ticket list narrows to the tickets that match, so the admin can open the right one
without scrolling through the whole inbox. Deleting the text shows all tickets again.

**Why this priority**: Filtering the tickets by what the admin types is the purpose of the
feature. Without it, the bar is decoration.

**Independent Test**: Open the inbox with mock data. Type a sender's email, a word from a
feedback text and a page path in turn, and check that the list shows exactly the matching
tickets each time. Then clear the field and check that the full list returns.

**Acceptance Scenarios**:

1. **Given** the inbox shows all tickets, **When** the admin types "anna" in the search field,
   **Then** the list shows only the tickets whose text, sender or page contains "anna" (e.g. the
   ticket from anna@company.dk), without the admin pressing Enter.
2. **Given** the inbox shows all tickets, **When** the admin types "/keywords", **Then** the list
   shows only tickets sent from a page whose path contains "/keywords".
3. **Given** the inbox shows all tickets, **When** the admin types "CSV" or "csv", **Then** both
   show the ticket "Would love to export the ranking table to CSV".
4. **Given** the inbox shows all tickets, **When** the admin types "anna overview", **Then** the
   list shows only tickets that contain both words, each anywhere in the searched details.
5. **Given** the category filter is "Bug" and the "Færdig" filter is on, **When** the admin
   searches, **Then** the list shows only tickets that match the search and both filters, in the
   chosen sort order, and the All/Done counts show how many "Bug" tickets match the search.
6. **Given** the admin has typed a search, **When** no ticket matches it, **Then** the list shows
   "Ingen feedback matcher søgningen."
7. **Given** a search is active, **When** the admin deletes the text or presses Escape in the
   field, **Then** the list shows all tickets again, with the filters and sort order unchanged.
8. **Given** a ticket is open in the detail panel, **When** the admin types a search that the
   ticket does not match, **Then** the detail panel shows "Vælg en feedback i listen for at se
   detaljerne.", and when the search is cleared the ticket is shown open again.

---

### User Story 2 - Search on any screen size (Priority: P2)

On a desktop, the bar runs across the top of the page to the right of the side menu, whatever the
width of the window. On a tablet or phone, the search field sits under the top bar with the menu
button and uses the full width of the screen.

**Why this priority**: The admin must be able to search on every screen the dashboard supports,
but the search itself (User Story 1) is what delivers the value.

**Independent Test**: Open the inbox at 1440px, 1024px, 834px and 390px wide. Check that the bar
and field match the design references, fit the window and cause no horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** a browser window at least 1024px wide, **When** the inbox loads, **Then** a bar with a
   line along its bottom spans the full width to the right of the side menu, with the search field
   at its left, as in the design reference.
2. **Given** the inbox is open at least 1024px wide, **When** the window is made wider or narrower,
   **Then** the bar keeps spanning the full width to the right of the side menu, and the search
   field keeps its width from the design.
3. **Given** a browser window narrower than 1024px, **When** the inbox loads, **Then** the search
   field sits directly under the top bar with the menu button and fills the width of the window
   apart from the page margins, as in the tablet design reference.
4. **Given** any window at least 320px wide, **When** the admin types a search longer than the
   field, **Then** the field stays inside the window, the text scrolls within the field, and the
   page cannot be scrolled sideways.

---

### Edge Cases

- The search contains only spaces: it counts as empty and all tickets are shown.
- Spaces before, after or between words are ignored: "  anna   overview " gives the same result
  as "anna overview".
- The search contains characters such as `*`, `.`, `?`, `(` or `<b>`: they match only themselves.
  They are never wildcards or patterns, and nothing typed is treated as markup.
- Danish letters: "ø" finds "Ø" and the other way round. "ø" does not find "oe".
- The words searched for are in a part of the feedback text the list row does not show (the row
  shows only the beginning): the ticket is still found, because the whole text is searched.
- The ticket number: "1042", "FB-1042" and "#FB-1042" all find ticket #FB-1042.
- A sender without a name: the ticket is still found by the sender's email and company.
- A ticket whose page address is not a web link (e.g. `javascript:…`): its page is searched as the
  text the list shows. It is never opened or followed.
- The admin opens a ticket they found by searching: it is marked as read as usual, so its "Ny"
  badge disappears and the side menu counts drop (spec 002, FR-006). Searching on its own marks
  nothing as read.
- The admin presses Enter in the field: nothing extra happens. The page does not reload and the
  text stays.
- The admin leaves the inbox and comes back, or reloads the page: the search field is empty again
  (spec 002, FR-017).
- The side menu is open on a small screen: the search field cannot be reached, like the rest of
  the page behind the menu (spec 002, FR-021).

## Requirements *(mandatory)*

### Functional Requirements

**Layout**

- **FR-001**: The inbox page MUST show a top bar above the inbox's filters, as in the design
  reference. The bar holds a search field with a magnifying-glass icon and the placeholder text
  "Søg i feedback, brugere, sider…".
- **FR-002**: In browser windows at least 1024px wide, the bar MUST span the full width to the right
  of the side menu at every window width, with a line along its bottom. The search field MUST sit
  at the bar's left edge with the width from the design (420px).
- **FR-003**: In browser windows narrower than 1024px, the search field MUST sit directly under the
  top bar with the menu button (spec 002, FR-018) and fill the width of the window apart from the
  page margins, as in the tablet design reference.
- **FR-004**: At every window width from 320px up, the bar and the field MUST fit inside the window
  without overlapping other content or making the page scroll sideways. Text longer than the field
  scrolls inside the field.
- **FR-005**: Only the inbox page (`/`) MUST show the bar. The platform, settings, page-not-found
  and logged-out pages do not.

**Search**

- **FR-006**: The ticket list MUST update as the admin types: after every change to the field it
  shows only the tickets that match, with no button or Enter needed. Pressing Enter MUST NOT reload
  the page or clear the field.
- **FR-007**: A ticket matches when every word of the search appears somewhere in its searched
  details (FR-008). Words are separated by spaces, and spaces before, after and between words are
  ignored. An empty search, or one of only spaces, shows all tickets.
- **FR-008**: The searched details of a ticket are:
  - the whole feedback text
  - the ticket number as shown in the detail panel (e.g. "#FB-1042")
  - the sender's name, email and company
  - the platform name ("GEOtracking" or "SimpleSERP")
  - the page path as shown in the list (e.g. "/overview")

  No other details are searched, including browser, operating system, screen size, attachments
  and replies.
- **FR-009**: Matching MUST ignore the difference between upper and lower case, including for æ, ø
  and å. Every character the admin types MUST be matched as plain text, with no wildcards or
  patterns.
- **FR-010**: The search MUST work together with the existing filters and sort order. The list shows
  the tickets that match the search, the category filter and the All/Done filter, in the chosen
  order. The All/Done counts MUST count only tickets that match the search, just as they already
  count only the chosen category.
- **FR-011**: When a search is active and no ticket matches, the list MUST show "Ingen feedback
  matcher søgningen." Without a search, the existing message "Ingen feedback matcher filtrene."
  stays.
- **FR-012**: If the search hides the ticket that is open in the detail panel, the panel MUST show
  its empty state, as it does when a filter hides the open ticket. When the ticket matches again,
  it MUST be shown open again.
- **FR-013**: Pressing Escape in the field MUST clear it and show all tickets that pass the filters
  again. The focus stays in the field.
- **FR-014**: Searching MUST NOT change any ticket. It marks nothing as read and does not change the
  side menu counts.
- **FR-015**: The search belongs to the inbox view. It MUST be empty whenever the inbox opens,
  including after moving to another admin page and back (spec 002, FR-017) and after a reload.

**Accessibility, language and design**

- **FR-016**: The search field MUST be usable with the keyboard alone and show a visible focus
  outline. Screen readers MUST announce it as a search field labelled "Søg i feedback". The
  placeholder text is not its label.
- **FR-017**: All text facing the user MUST be in Danish: "Søg i feedback, brugere, sider…", "Søg i
  feedback" and "Ingen feedback matcher søgningen.". Feedback content is shown as it is.
- **FR-018**: The visual design MUST match the design reference and use the project's design
  tokens. A value the design needs that the tokens lack (e.g. the field's background, border and
  width) MUST be taken from Figma and added as a token (Constitution Principle I).

### Key Entities

- **Search text**: What the admin has typed into the search field. It belongs to the inbox's view
  together with the filters and sort order, and is never saved.
- **Feedback** (existing): A ticket in the inbox. The details searched are listed in FR-008.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every feedback item in the mock data, typing its sender's email, its ticket
  number or a distinctive word from its text shows that item in the list (100% of items checked).
- **SC-002**: For every search in the acceptance scenarios, the list contains exactly the tickets
  that match the search and the active filters, with none missing and none extra (100% of checks).
- **SC-003**: With up to 1,000 feedback items, the list reflects each keystroke within 0.2 seconds,
  so typing never feels delayed.
- **SC-004**: Clearing the search, by deleting the text or pressing Escape, brings back exactly the
  list shown before searching, with the same filters and order (100% of checks).
- **SC-005**: At window widths of 1440px and 834px, the bar shows no differences from the design
  references in color, spacing, typography or layout beyond the agreed Danish wording.
- **SC-006**: At every window width from 320px to 2560px, the bar spans the width available to it,
  the field is fully visible, and the page cannot be scrolled sideways.
- **SC-007**: An admin using only the keyboard can reach the field, search, clear the search with
  Escape and move on to the results.

## Assumptions

- Only the inbox page gets the bar, because the description asks for a bar "over the inbox-view".
  The design also shows the bar on the settings page. It can be added to other pages once they
  have something to search.
- The searched details follow the placeholder text: "feedback" means the feedback text and its
  number, "users" means the sender's name, email and company, and "pages" means the page path. The
  platform name is included because every list row shows it.
- "Responsive with the width of the screen" means that the bar always spans the width available to
  it. On wide windows the field keeps its width from the design (420px) instead of growing, as in
  the 1440px design. On narrow windows it fills the width, as in the tablet design.
- Below 1024px, phones use the same 24px page margins as tablets. The mobile frames' 16px margins
  are out of scope, as in spec 002.
- The bar scrolls with the page. Keeping it fixed at the top while the page scrolls is out of
  scope.
- The search text is not part of the web address and is not saved, so a search cannot be
  bookmarked or shared.
- Search suggestions, search history, highlighting of matched words and searching on other pages
  are out of scope.
- The heading "Feedback inbox", the key-figure cards and the "1 new feedback just arrived" banner
  in the design reference are separate features.
- All data is mock data, and the search runs over the tickets the inbox already has. Moving the
  search to the backend when it exists is out of scope.
- The Figma frames use English text. The bar uses Danish, as the constitution requires.
