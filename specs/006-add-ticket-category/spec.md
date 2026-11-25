# Feature Specification: Add Ticket Category

**Feature Branch**: `category-settings`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "The admin user should be able to create a new ticket category. When clicking on the button 'Add new category' a modal should appear. In the modal the adminuser can write what the new category should be and click an 'Add category' button to make it so. The user should also be able to cancel. The UI should be in Danish even though the screenshots have UI in English. Follow attached screenshots for design reference."

**Related specs**:

- [Spec 001](../001-feedback-inbox/spec.md) defines the inbox and its category filter, which
  today offers the three fixed categories Fejl, Forslag and Generel feedback. This feature adds
  new categories to that filter.
- [Spec 002](../002-side-menu/spec.md) created the settings page as a placeholder (FR-009); this
  feature gives it its first real content.
- [Spec 004](../004-zustand-ticket-store/spec.md) defines how changes made during a session are
  shared between pages and when they are cleared (log-out, reload).

**Design reference**:

- [design/desktop.png](design/desktop.png): the settings page on desktop, with the Categories
  card and, below it, a Team & Access card.
- [design/tablet.png](design/tablet.png): the same page on tablet, with the top bar.
- [design/mobile.png](design/mobile.png): the same page on mobile; the card's button moves under
  the card title.
- [design/categories-card.png](design/categories-card.png): the Categories card on its own: a
  title, a subtitle, an "Add new category" button, and one row per category with an icon, a name
  and an on/off switch.
- [design/modal.png](design/modal.png): the "Add new category" dialog: title, short description,
  a "Category name" field with an example placeholder and a helper text, a "Category icon" grid
  of icon buttons (icon plus name, the chosen one highlighted), a "Category color" row of eight
  colour circles, a close (×) button, and "Cancel" and "Add category" buttons. The design's
  Camera, Video, Image and Shield icons are illustrative; the dialog offers the icons the
  product has (FR-019).

The Figma text is English; the product shows Danish text (constitution, Principle I). The
category names and the on/off states in the screenshots are illustrative; the page shows the
categories the product actually has.

**Background**: In the future, an AI will sort incoming feedback into categories; neither the
person sending feedback nor the admin picks a ticket's category. The admin decides which
categories exist and switches each one on or off: an "on" category is one the AI may choose, an
"off" category is one it may not. The AI is not part of this feature, so for now a switch only
records the admin's choice. Where the design's English text says that users choose a category,
the Danish text below describes the AI instead.

## Clarifications

### Session 2026-11-25

- Q: Which icons should the admin be able to choose from under "Kategori-ikon"? → A: The seven
  icon components in the project's icons folder that work as category symbols: Branch, Bug,
  Inbox, Lightbulb, Message, Paperclip and Progress (ArrowLeft and Check are left out because
  they look like controls). The admin also picks one of eight colours; the chosen icon and
  colour are highlighted, and the colour is used for the icon and its tinted background wherever
  the category is shown, like the built-in categories.
- Q: When the dialog opens, should an icon and a colour already be chosen? → A: No. Nothing is
  pre-chosen; "Tilføj kategori" can only be pressed once a name, an icon and a colour are all
  chosen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a new category (Priority: P1)

An admin opens Settings, sees the categories that feedback can be sorted into, presses "Tilføj
ny kategori", types a name in the dialog that opens, picks an icon and a colour, and presses
"Tilføj kategori". The dialog closes and the new category appears in the list with that icon in
that colour.

**Why this priority**: This is the feature. Without it, the team is stuck with the three
categories the product ships with.

**Independent Test**: Open Settings, add a category called "Forbedring" with the Inbox icon and
the blue colour, and check that the dialog closes and "Forbedring" now appears in the Categories
list with a blue Inbox icon on a light blue circle.

**Acceptance Scenarios**:

1. **Given** the admin is on Settings, **When** the page loads, **Then** a "Kategorier" card
   lists the existing categories (Fejl, Forslag, Generel feedback), each with its icon, and shows
   a "Tilføj ny kategori" button.
2. **Given** the Categories card, **When** the admin presses "Tilføj ny kategori", **Then** a
   dialog opens with the title "Tilføj ny kategori", a "Kategorinavn" field that has focus, a
   "Kategori-ikon" group with seven icon choices, a "Kategorifarve" group with eight colour
   choices, and the buttons "Annuller" and "Tilføj kategori".
3. **Given** the dialog is open, **When** the admin presses the Inbox icon and the blue colour,
   **Then** both are highlighted as chosen, and pressing another icon or colour moves the
   highlight to it.
4. **Given** the dialog is open, **When** the admin types "Forbedring", chooses the Inbox icon and
   the blue colour, and presses "Tilføj kategori", **Then** the dialog closes and "Forbedring"
   appears as the last row in the list, with the Inbox icon drawn in blue on a light blue circle.
5. **Given** the dialog is open with a name typed, **When** the admin presses Enter in the field,
   **Then** the category is added, the same as pressing "Tilføj kategori".
6. **Given** the admin has added "Forbedring", **When** they open the inbox and then return to
   Settings in the same session, **Then** "Forbedring" is still in the list, with its icon and
   colour.
7. **Given** the dialog has just closed, **When** the admin continues with the keyboard,
   **Then** focus is back on the "Tilføj ny kategori" button.

---

### User Story 2 - Change your mind (Priority: P1)

An admin opens the dialog by mistake, or starts typing and decides against it, and closes the
dialog without adding anything.

**Why this priority**: The user asked for it explicitly, and a dialog that cannot be left
safely is not usable. It ships together with Story 1.

**Independent Test**: Open the dialog, type a name, press "Annuller", and check that the list is
unchanged and the dialog is gone.

**Acceptance Scenarios**:

1. **Given** the dialog is open with a name typed, **When** the admin presses "Annuller",
   **Then** the dialog closes and no category is added.
2. **Given** the dialog is open, **When** the admin presses the close (×) button or the Escape
   key, **Then** the dialog closes and no category is added.
3. **Given** the dialog is open, **When** the admin clicks outside it, **Then** the dialog closes
   and no category is added.
4. **Given** the admin cancelled with "Forbedring" typed and an icon and colour chosen, **When**
   they open the dialog again, **Then** the field is empty and no icon or colour is chosen.

---

### User Story 3 - Switch a category on or off (Priority: P2)

An admin decides which categories the AI may use when it sorts feedback, by switching each
category on or off in the list.

**Why this priority**: It is how the admin steers the future AI sorting, but adding a category
(Story 1) is useful without it.

**Independent Test**: Switch "Generel feedback" off, go to the inbox and back, and check that the
switch is still off and the other categories are unchanged.

**Acceptance Scenarios**:

1. **Given** the Categories card, **When** the page loads, **Then** every row shows a switch,
   and Fejl, Forslag and Generel feedback are all on.
2. **Given** a category is on, **When** the admin presses its switch, **Then** the switch shows
   off; pressing it again shows on.
3. **Given** the admin has just added "Forbedring", **When** it appears in the list, **Then** its
   switch is on.
4. **Given** the admin switched "Generel feedback" off, **When** they move to another page and
   back in the same session, **Then** it is still off.
5. **Given** a switch has keyboard focus, **When** the admin presses Space, **Then** it changes
   state, and a screen reader announces the category name and whether it is on or off.
6. **Given** "Fejl" is off, **When** the admin uses the inbox, **Then** the inbox is unchanged:
   tickets in Fejl are still listed, and Fejl is still in the category filter.

---

### User Story 4 - Be stopped from adding a bad name (Priority: P2)

An admin tries to add a category with no name, or with a name that already exists, and is told
why it was not added instead of ending up with a blank or duplicate category.

**Why this priority**: It protects the list from mistakes, but the happy path in Story 1 works
without it.

**Independent Test**: Try to add "fejl" and an empty name, and check that neither is added and
the dialog explains why.

**Acceptance Scenarios**:

1. **Given** the field is empty or contains only spaces, **When** the admin looks at the dialog,
   **Then** "Tilføj kategori" cannot be pressed.
2. **Given** the dialog has just opened and the admin types "Forbedring", **When** no icon or no
   colour has been chosen yet, **Then** "Tilføj kategori" cannot be pressed; once both are
   chosen, it can.
3. **Given** a category "Fejl" exists, **When** the admin types "fejl" (any letter case, with or
   without spaces around it) and tries to add it, **Then** nothing is added, the dialog stays
   open, and it says the category already exists.
4. **Given** the admin types "  Forbedring  ", **When** they add it, **Then** the category is
   called "Forbedring", without the spaces.
5. **Given** the admin types a name longer than 40 characters, **When** they type the 41st
   character, **Then** it is not accepted.
6. **Given** the admin types `<b>Forbedring</b>`, **When** they add it, **Then** the list shows
   exactly those characters as text, not bold text.

---

### Edge Cases

- A name that differs from an existing one only in letter case or surrounding spaces counts as
  a duplicate; Danish letters (æ, ø, å) are compared case-insensitively too.
- The dialog shows the duplicate message only after an attempt to add, and removes it as soon as
  the name is changed.
- While the dialog is open, the rest of the page cannot be reached with the mouse or the
  keyboard, and Tab stays inside the dialog.
- On mobile the dialog fits the screen width; the card's button sits under the card title, as in
  the mobile design.
- Added categories last for the session only, like ticket changes (spec 004): logging out or
  reloading the page brings back the original three.
- A new category has no tickets yet. It appears in the inbox's category filter straight away,
  and choosing it shows the "no feedback matches the filters" message.
- The admin may switch every category off; nothing warns about it, since no AI uses the
  switches yet.
- Switching a category off or on never changes existing tickets or what the inbox shows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The settings page MUST show the heading "Indstillinger" with the subtitle
  "Opsæt feedback-widget, kategorier, notifikationer og datahåndtering", and below it a
  "Kategorier" card with the subtitle "Det AI'en kan sortere feedback i", laid out as in the
  design on desktop, tablet and mobile.
- **FR-002**: The Categories card MUST list every category in the order they were added,
  starting with Fejl, Forslag and Generel feedback, each with its icon, its name and an on/off
  switch.
- **FR-003**: The Categories card MUST show a "Tilføj ny kategori" button that opens the add
  dialog.
- **FR-004**: The dialog MUST show the title "Tilføj ny kategori", the description "Giv AI'en
  en ny måde at sortere feedback på.", a field labelled "Kategorinavn" with the
  placeholder "f.eks. Forbedring", the helper text "AI'en kan vælge kategorien, når den sorterer
  feedback.", a close
  (×) button, a "Kategori-ikon" group (FR-019), a "Kategorifarve" group (FR-020), and the
  buttons "Annuller" and "Tilføj kategori", as in the design.
- **FR-005**: When the dialog opens, the name field MUST be empty and have focus, and no icon and
  no colour MUST be chosen.
- **FR-006**: Pressing "Tilføj kategori", or Enter in the field, MUST add a category with the
  typed name (spaces at the start and end removed), close the dialog, and show the new category
  as the last row in the list, switched on.
- **FR-007**: "Annuller", the close (×) button, the Escape key and a click outside the dialog
  MUST close it without adding anything.
- **FR-008**: "Tilføj kategori" MUST NOT be pressable while the name is empty or only spaces, no
  icon is chosen, or no colour is chosen; pressing Enter in the field MUST then do nothing.
- **FR-009**: The name field MUST accept at most 40 characters.
- **FR-010**: A name equal to an existing category's name, ignoring letter case and surrounding
  spaces, MUST NOT be added; the dialog MUST stay open and show "Der findes allerede en kategori
  med det navn." until the name is changed.
- **FR-011**: After the dialog closes, focus MUST return to the "Tilføj ny kategori" button.
  While it is open, the page behind it MUST NOT be reachable by mouse or keyboard.
- **FR-012**: Every control MUST be usable with the keyboard alone (Tab, Enter, Space, Escape),
  and the dialog MUST be announced as a dialog with its title.
- **FR-013**: Category names MUST be shown as plain text everywhere they appear (constitution,
  Principle III).
- **FR-014**: Categories added during a session MUST stay when the admin moves between pages,
  and MUST be cleared on log-out and on a full page reload, the same as ticket changes (spec 004).
- **FR-015**: A new category MUST be shown with its chosen icon, drawn in a darker shade of its
  chosen colour on a light tint of that colour, with the icon clearly visible against the tint, everywhere a category's icon appears (the Categories list and the
  inbox's ticket list and ticket detail), the same way the built-in categories are shown.
- **FR-016**: Each category's switch MUST show whether the category is on (the AI may choose it)
  or off (the AI may not), and pressing it MUST change that state. The three built-in categories
  MUST start on. Switch states MUST follow the same session rules as added categories (FR-014).
- **FR-017**: Switching a category on or off MUST NOT change existing tickets or what the inbox
  shows.
- **FR-018**: A category added in Settings MUST appear as a choice in the inbox's category filter
  straight away, after the existing ones.
- **FR-019**: The "Kategori-ikon" group MUST show the hint "Vælg én" next to its label, as in the
  design, and MUST offer exactly seven icons, each as a button with the
  icon and a Danish name: Idé (lightbulb), Fejl (bug), Besked (speech bubble), Indbakke (inbox),
  Vedhæftning (paperclip), Forgrening (branch) and Fremskridt (progress). The icons MUST be the
  ones the product already uses (its icons folder), not new ones.
- **FR-020**: The "Kategorifarve" group MUST offer the eight colours shown in the design (red,
  orange, yellow, green, teal, blue, purple, pink), each as a round button whose accessible
  name is the Danish colour name (Rød, Orange, Gul, Grøn, Turkis, Blå, Lilla, Pink).
- **FR-021**: At most one icon and at most one colour MUST be chosen at a time; the chosen icon
  and colour MUST be visibly highlighted as in the design, and their chosen state MUST be
  available to screen readers.

### Key Entities *(include if feature involves data)*

- **Category**: A label that feedback can be sorted into. Has a name (unique within the
  workspace regardless of letter case), an icon (one of seven), a colour (one of eight), and an
  on/off state that says whether the AI may choose it. Two categories may share an icon or a
  colour. The product starts with three built-in categories, all on: Fejl, Forslag and
  Generel feedback. Categories added by an admin belong to the workspace. A ticket has exactly one
  category, set by the AI (in future), never by the sender or the admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can add a new category from the settings page in under 15 seconds,
  using no more than one button press to open the dialog and one to confirm.
- **SC-002**: Closing the dialog in any of its four ways (Annuller, ×, Escape, click outside)
  adds nothing in 100% of attempts.
- **SC-003**: No blank or duplicate category (ignoring letter case and surrounding spaces) can
  be added.
- **SC-006**: An admin can switch any category on or off with one press, and the state is kept
  for the rest of the session.
- **SC-004**: The whole flow (open, type, add or cancel) can be completed with the keyboard
  alone.
- **SC-005**: The settings page and dialog match the design on desktop, tablet and mobile, with
  all text in Danish.

## Assumptions

- Only the Categories card is in scope. The "Team & Access" card in the design is a separate
  feature and is not built here.
- Renaming or deleting categories is out of scope.
- The AI that sorts feedback into categories is out of scope; the on/off switches only record
  the admin's choice until it exists.
- There is no backend yet, so added categories live for the session only, like ticket changes
  (spec 004). Saving them permanently comes with the backend.
- Neither the person sending feedback nor the admin assigns a ticket's category; until the AI
  exists, only the sample tickets have categories, so new categories have no tickets.
- The built-in categories keep their current Danish names and icons; the names in the design
  (Feature, Bug, Other, Praise) are illustrative. They follow the same colour rule as new
  categories: Fejl is red, Forslag yellow and Generel feedback teal.
- 40 characters is enough for a category name; the design shows short, one- or two-word names.
- The Danish texts in FR-001, FR-004 and FR-010 are translations of the design's English text and
  may be adjusted in review. The card subtitle, the dialog's description and its helper text deliberately differ
  from the design's "What users can choose between", "Give users another way to organize their
  feedback" and "This category will be available for users to select", because users do not
  choose categories.
- Every admin may add categories; there are no permission levels yet.
