# Feature Specification: Side Menu

**Feature Branch**: `side-menu`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Next feature is a side-menu. In the side-menu you can see which platforms are connected, in the screenshots, the platform examples are "GEOtracking" and "SimpleSERP". Above them you can see that it says "Organic Growth". This is the company that you are connected via. At the bottom of the sidemeny, you can see a button for "Settings" which should take you the settings-page. Under the settingsbutton you can see your username, role and the company you belong to again, and the icon is for logging out. Clicking log out should log you out immediately. Use attached screenshots for design-reference. side-menu.png is for the component itself. The other screenshots are how the component should fit into the rest of the page. For navigating, you my create empty pages that just states which page you are on. Use mock data."

**Design reference**:

- The side menu itself: [design/side-menu.png](design/side-menu.png)
- How it fits the page:
  - Workspace selected (all feedback): [design/page-workspace.png](design/page-workspace.png)
  - A platform selected: [design/page-platform.png](design/page-platform.png)
  - Settings selected: [design/page-settings.png](design/page-settings.png)
- Figma: [Keep – eksamen, "Sidemeny"](https://www.figma.com/design/Tw9qt246dOOdNdSOMXx65z/Keep---eksamen?node-id=323-2095) (node `323:2095`; also inside the page frame `323:1675`, node `323:1676`)

## Clarifications

### Session 2026-11-17

- Q: When the admin leaves the inbox and comes back, what should the inbox still remember
  besides which tickets have been opened? → A: Keep all ticket changes (opened, status, sent
  reply, GitHub issue); reset the view (filters, sort, open ticket, reply draft) to its
  defaults.
- Q: When a page is taller than the browser window, should the side menu stay fixed in place
  while only the page content scrolls? → A: Yes: the menu fills the window height and stays in
  place; only the page content scrolls, and the user block is always visible at the bottom.
- Q: Should the web addresses of the new pages be in English or Danish? → A: English (`/`,
  `/platforms/geotracking`, `/platforms/simpleserp`, `/settings`, `/logged-out`); only readable
  text facing the user is in Danish.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See where I am and what is waiting (Priority: P1)

An admin sees a menu along the left edge of every admin page. At the top it shows the product
name ("Feedback · Admin"), then the company workspace they work in ("Organic Growth") and,
under a "Platforme" heading, each platform connected to that workspace (GEOtracking and
SimpleSERP). Next to the workspace and each platform is the number of new (unopened) feedback
items. The menu item for the page the admin is on is highlighted.

**Why this priority**: The menu is the admin's map of the product. Knowing which workspace and
platforms exist and where new feedback is waiting is the main reason the menu exists.

**Independent Test**: Open any admin page with mock data and verify the menu shows the product
name, workspace, both platforms with their counts, the settings item and the user block, and
that the current page's item is highlighted.

**Acceptance Scenarios**:

1. **Given** the admin is on any admin page, **When** the page loads, **Then** the side menu is
   shown along the full height of the left edge, as in the design reference.
2. **Given** the workspace has two connected platforms, **When** the admin looks at the menu,
   **Then** "Organic Growth" appears above a "Platforme" heading followed by GEOtracking and
   SimpleSERP, each with its own icon.
3. **Given** a platform has new feedback, **When** the admin looks at the menu, **Then** the
   platform shows the number of new items (e.g. "3 nye"), and the workspace shows the total
   for all its platforms (e.g. "4 nye").
4. **Given** the admin is on the workspace page, **When** they look at the menu, **Then**
   "Organic Growth" is highlighted and no other item is.
5. **Given** GEOtracking shows "3 nye" and the workspace "4 nye", **When** the admin opens an
   unread GEOtracking ticket in the inbox, **Then** the menu immediately shows "2 nye" for
   GEOtracking and "3 nye" for the workspace.
6. **Given** the admin has opened tickets, sent a reply and created a GitHub issue in the inbox,
   **When** they go to the settings page and back, **Then** those tickets are still opened, the
   reply and status changes are still there, and the counts are unchanged.
7. **Given** the admin had the "Færdig" filter on and a ticket open in the inbox, **When** they
   go to the settings page and back, **Then** the inbox shows all tickets, newest first, with
   no ticket open.

---

### User Story 2 - Move between workspace, platforms and settings (Priority: P1)

The admin clicks an item in the menu to go to that page: the workspace item opens the page with
all feedback for the workspace (the existing feedback inbox), each platform opens a page for
that platform, and "Indstillinger" opens the settings page. Platform and settings pages are
empty for now and only state which page the admin is on.

**Why this priority**: Without navigation the menu is only decoration. Together with User
Story 1 this is the minimum useful menu.

**Independent Test**: Click each menu item and verify the matching page opens, states its name,
and the clicked item becomes the highlighted one.

**Acceptance Scenarios**:

1. **Given** the admin is on the settings page, **When** they click "Organic Growth", **Then**
   the feedback inbox opens and "Organic Growth" is highlighted.
2. **Given** the admin is on the workspace page, **When** they click "GEOtracking", **Then** a
   page opens that states it is the GEOtracking page, and "GEOtracking" is highlighted.
3. **Given** the admin is on any page, **When** they click "Indstillinger", **Then** a page
   opens that states it is the settings page, and "Indstillinger" is highlighted.
4. **Given** the admin opens a platform or settings page directly by its web address, **When**
   the page loads, **Then** the matching menu item is highlighted.

---

### User Story 3 - See who I am logged in as and log out (Priority: P2)

At the bottom of the menu the admin sees their own name, role and company (e.g. "Hussein",
"Admin · Organic Growth") with their initial as an avatar, and a log-out icon. Clicking the icon
logs them out at once, without a confirmation step.

**Why this priority**: Knowing which account is active matters, and logging out is expected,
but with mock data there is no real account, so this comes after navigation.

**Independent Test**: Check the user block shows the mock user's name, role and company, then
click log out and verify the "Du er logget ud" page opens without the menu, and that "Log ind
igen" leads back to the workspace page.

**Acceptance Scenarios**:

1. **Given** the admin is logged in, **When** they look at the bottom of the menu, **Then** they
   see their initial, name, and "{role} · {workspace name}".
2. **Given** the admin is on any admin page, **When** they click the log-out icon, **Then** the
   "Du er logget ud" page opens at once, with no confirmation dialog and without the side menu.
3. **Given** the admin is on the "Du er logget ud" page, **When** they click "Log ind igen",
   **Then** the workspace page opens with the side menu.

---

### Edge Cases

- A platform has no new feedback: its count is hidden instead of showing "0 nye".
- The workspace has no new feedback at all: the workspace count is hidden.
- A long workspace, platform, user or company name: it is cut off with an ellipsis and does not
  push the count or the log-out icon out of the menu.
- The admin opens an address for a platform that does not exist in the workspace: a "page not
  found" page is shown, with the menu still visible.
- The page content is taller than the browser window: only the content scrolls; the menu stays
  in place with "Indstillinger" and the user block visible (FR-001).
- The menu's own content does not fit (many platforms, or a short browser window): the platform
  list scrolls inside the menu, and "Indstillinger" and the user block stay visible at the
  bottom.
- The admin reloads the "Du er logget ud" page or opens it directly: it shows the same page; it
  does not log anyone in or out by itself.

## Requirements *(mandatory)*

### Functional Requirements

**Layout**

- **FR-001**: Every admin page MUST show the side menu along the full height of the left edge,
  with the page content to its right, as in the design reference. The menu MUST fill the height
  of the browser window and stay in place when the page content scrolls, so "Indstillinger" and
  the user block are always visible at the bottom.
- **FR-002**: The top of the menu MUST show the product name "Feedback · Admin".

**Workspace and platforms**

- **FR-003**: The menu MUST show the admin's workspace ("Organic Growth") with its avatar and
  its count of new feedback.
- **FR-004**: Below the workspace, under the heading "Platforme", the menu MUST list every
  platform connected to the workspace (GEOtracking and SimpleSERP), each with its own icon and
  count of new feedback.
- **FR-005**: "New" means feedback that no admin has opened yet. A platform's count is the
  number of new feedback items from that platform; the workspace count is the sum over all its
  platforms. Counts of zero are hidden, including the moment the admin opens the last unread
  ticket of a platform: that platform's count disappears and the workspace count drops
  accordingly.
- **FR-006**: The counts MUST update immediately while the admin works: opening an unread ticket
  in the inbox lowers the count for its platform and for the workspace by one at once. The menu
  counts and the inbox's "Ny" badges MUST always agree.
- **FR-017**: All changes to tickets made in the inbox MUST be kept while the admin moves between
  admin pages in the same session (e.g. inbox → settings → inbox): which tickets are opened,
  status changes, sent replies and created GitHub issues. The inbox view itself (filters, sort
  order, the open ticket and an unsent reply draft) MUST return to its defaults when the admin
  comes back. A full reload restores the mock data, as in the inbox feature.

**Navigation**

- **FR-007**: Clicking the workspace MUST open the page with all feedback for the workspace (the
  existing feedback inbox).
- **FR-008**: Clicking a platform MUST open that platform's page. For now this page only states
  which platform it is (e.g. heading "GEOtracking").
- **FR-009**: Clicking "Indstillinger" (with its gear icon) at the bottom of the menu MUST open
  the settings page. For now this page only states that it is the settings page.
- **FR-010**: The menu item for the current page MUST be highlighted as in the design reference;
  exactly one item is highlighted at a time.
- **FR-011**: Every page MUST have its own web address, so it can be bookmarked, reloaded and
  opened directly with the right item highlighted. The addresses are in English: `/` (workspace
  page), `/platforms/geotracking`, `/platforms/simpleserp`, `/settings` and `/logged-out`.

**User and log out**

- **FR-012**: Below "Indstillinger", separated by a line, the menu MUST show the logged-in user:
  an avatar with their initial, their name, and "{role} · {workspace name}" (e.g. "Admin ·
  Organic Growth").
- **FR-013**: A log-out icon next to the user MUST log the user out immediately when clicked,
  with no confirmation step, and open a "logged out" page. That page has its own web address,
  does not show the side menu, states "Du er logget ud" and has a "Log ind igen" button that
  opens the workspace page. Logging out is simulated: no real session exists, and admin pages
  stay reachable by their web address.

**Accessibility, language and design**

- **FR-014**: Every menu item and the log-out icon MUST be usable with the keyboard alone
  (reachable with Tab, activated with Enter), with a visible focus outline, and the log-out icon
  MUST have a text label for screen readers ("Log ud").
- **FR-015**: All readable text facing the user MUST be in Danish (e.g. "Platforme",
  "Indstillinger", "4 nye", "Log ud"). Names of the product, workspace, platforms and user are
  shown as they are. Web addresses are not user-facing text and stay in English (FR-011).
- **FR-016**: The visual design MUST match the design reference and use only the project's
  existing design tokens.

### Key Entities

- **Workspace**: The company the admin is connected through (e.g. "Organic Growth"). Has a name,
  an avatar, and one or more connected platforms.
- **Platform**: A product connected to the workspace that collects feedback (GEOtracking,
  SimpleSERP). Has a name, an icon and a count of new feedback.
- **User**: The logged-in admin. Has a name, a role (e.g. "Admin") and belongs to a workspace.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any admin page, an admin can reach the workspace page, any platform page or
  the settings page with a single click.
- **SC-002**: On every page, exactly one menu item is highlighted, and it matches the page shown
  (100% of pages checked).
- **SC-003**: The new-feedback counts shown for each platform and for the workspace match the
  number of unopened feedback items in the data (100% of checks).
- **SC-004**: In a side-by-side review with the design reference, the menu shows no differences
  in color, spacing, typography or layout beyond the agreed Danish wording.
- **SC-005**: Logging out takes exactly one click and no confirmation.
- **SC-007**: After opening an unread ticket, the menu counts are updated before the admin can
  look back at the menu (no noticeable delay, under 0.5 seconds), in 100% of checks.
- **SC-006**: An admin using only the keyboard can reach and use every menu item and log out.

## Assumptions

- Only the side menu and the empty platform and settings pages are in scope. The top search
  bar, the page headings, the key-figure cards, the priority cards on the platform page and the
  contents of the settings page shown in the screenshots are separate features.
- The workspace page is the existing feedback inbox; it gets the menu beside it but its content
  does not change.
- The admin belongs to exactly one workspace; switching between workspaces is out of scope.
- The workspace avatar is the plain dark circle from the design until real logos exist.
- Clicking "Feedback · Admin" at the top opens the workspace page.
- All data (workspace, platforms, user, and the feedback the counts are based on) is mock data.
  Counts are calculated from the same mock feedback the inbox uses, so the two never disagree.
  With the current mock data the counts are smaller than in the screenshots (e.g. 3 for
  GEOtracking instead of 8).
- There is no real login yet. Logging out is simulated (FR-013); protecting admin pages from
  logged-out users comes with real authentication.
- The design is for desktop screens; small-screen layouts (e.g. a collapsible menu) are out of
  scope.
