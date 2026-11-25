# Research: Add Ticket Category

All open points from the spec and the Technical Context are resolved below.

## R1. Component structure

- **Decision**: Three components, as asked:
  - `components/category-settings/CategorySettings.tsx`: the Categories card. Reads the category
    store, loops over the categories, owns the dialog's open state.
  - `components/category-settings/CategoryRow/CategoryRow.tsx`: one row (icon badge, name,
    switch), rendered once per category in that loop.
  - `components/category-settings/AddCategoryModal/AddCategoryModal.tsx`: the dialog with the
    name field, the icon choices and the colour choices.

  No other new components. The icon choices, colour choices and the switch are plain markup
  inside `AddCategoryModal` and `CategoryRow`. Drawing a category's icon by name uses a lookup
  map (R6), not a new component.
- **Rationale**: Follows the user's instructions and the folder convention from spec 001 (main
  component at the root of its folder, each sub-component in its own folder, no `index.ts`).
  `CategorySettings` reads the store directly, as `Inbox` and `SideMenu` do since the container
  merges; `CategoryRow` and `AddCategoryModal` get everything through props (Constitution V).
- **Alternatives considered**: separate `IconPicker`, `ColorPicker` and `Switch` components
  (more reusable, but the user asked to avoid extra components, and nothing else needs them
  yet); a `CategorySettingsContainer` (the project just removed that pattern).

## R2. Category store

- **Decision**: A new Zustand store, `useCategoriesStore` in `lib/categories/store.ts`, with
  `{ categories: Category[] }`, seeded from `mockCategories` in a new `lib/mock-categories.ts`.
  Changes go through action functions (`addCategory`, `toggleCategory`, `resetCategories`) that
  run a pure `categoriesReducer` in `lib/categories/state.ts`. Same shape as the ticket store
  (spec 004).
- **Rationale**: The user asked for its own store with mock data as the start value. Keeping the
  store/reducer split makes every rule testable without React and keeps one way of doing state
  in the app.
- **Alternatives considered**: putting categories in the ticket store (mixes two entities and
  their resets); local `useState` in `CategorySettings` (lost on navigation, and the inbox could
  not see new categories, FR-018).

## R3. Session lifetime (FR-014)

- **Decision**: Like tickets: the store survives page changes, a full reload brings back the mock
  data (no persistence), and `/logged-out` clears it. `ResetTickets` gets a second call,
  `resetCategories()`, and its comment changes to say it resets the session's changes.
  `vitest.setup.ts` resets the category store after every test, like the ticket store.
- **Rationale**: FR-014 asks for the same rules as ticket changes. One component already runs on
  `/logged-out`; adding a second one would add a component for one line.
- **Alternatives considered**: a new `ResetCategories` component (extra component); renaming
  `ResetTickets` to `ResetSession` (clearer, but renames a file outside this feature; can be done
  later).

## R4. Category identity and the `Feedback` type (Constitution II)

- **Decision**: Add `Category` to `lib/types.ts`, shaped like a planned Convex `categories`
  document (`_id`, `_creationTime`, `workspaceId`, `name`, `icon`, `color`, `isEnabled`).
  `Feedback.category` becomes the category's `_id` (`Category["_id"]`) instead of the union
  `"bug" | "idea" | "general"`, and `FeedbackCategory` is removed. The three built-in categories
  keep the ids `bug`, `idea` and `general`, so mock tickets and fixtures do not change. New ids
  come from `crypto.randomUUID()`, read in the event handler.
- **Rationale**: New categories cannot fit a fixed union. Keeping the built-in ids means the
  existing data and the "bugs this week" key number (spec 005, `category === "bug"`) still work.
  Keeping the field name `category` avoids touching every ticket; it becomes `categoryId:
  Id<"categories">` when the Convex schema arrives.
- **Alternatives considered**: renaming the field to `categoryId` now (matches Convex naming, but
  touches mock data, fixtures and tests for no behaviour change); a widened union with `string`
  (loses type safety without gaining anything).

## R5. Name rules (FR-008, FR-009, FR-010)

- **Decision**: One pure function, `validateCategoryName(name, categories)` in
  `lib/categories/state.ts`, returns `"empty" | "duplicate" | null`. It trims the name and
  compares with `toLocaleLowerCase("da")` on both sides, so "FEJL", " fejl " and "Fejl" match,
  and Æ/Ø/Å match æ/ø/å. The field has `maxLength={40}`. The reducer trims the name when adding
  and ignores an `add` whose name is invalid, so the store can never hold a blank or duplicate.
- **Rationale**: Testable without the DOM; the reducer guard protects the store even if a
  caller skips the check.
- **Alternatives considered**: `localeCompare` with `sensitivity: "base"` (also ignores accents,
  so "Idé" would equal "Ide"; too broad).

## R6. Icons (FR-015, FR-019)

- **Decision**: `Category.icon` is one of `lightbulb`, `bug`, `message`, `inbox`, `paperclip`,
  `branch`, `progress`. A map in `components/Icons/category-icons.ts` gives each its SVG
  component and Danish name (Idé, Fejl, Besked, Indbakke, Vedhæftning, Forgrening, Fremskridt).
  `LightbulbIcon` and `MessageIcon` switch from hard-coded stroke colours (`#9A6700`, `#0F766E`)
  to `currentColor`, as `BugIcon` did in spec 005; their colour moves to CSS (R7), so today's
  look does not change.
- **Rationale**: All seven icons must take the category's colour. A map is data, not a component,
  and is reused by `CategoryRow`, `AddCategoryModal` and `TicketRow`.
- **Alternatives considered**: a `CategoryIcon` component (the user asked to avoid extra
  components; the map does the same job).

## R7. Colours (FR-015, FR-020)

- **Decision**: `Category.color` is one of eight names. Each colour has three tokens in
  `globals.css`:
  - `--category-<colour>`: the colour the user gave, shown as the swatch in the dialog;
  - `--category-<colour>-fg`: a darker shade of it, used for the icon;
  - `--category-<colour>-bg`: a lighter tint of it, used for the circle behind the icon.

  One class per colour, `.category-badge--<colour>`, sets `color` and `background`. The tint is
  the colour mixed 15% into white. The icon shade is the colour mixed with black, in 5% steps,
  until the icon reaches at least 4.5:1 contrast against its tint, so even a small (16px) icon is
  easy to see (WCAG asks 3:1 for graphics).

  | Colour | Danish | Swatch | Icon | Tint | Icon on tint |
  | --- | --- | --- | --- | --- | --- |
  | `red` | Rød | `#ff0000` | `#cc0000` (20% darker) | `#ffd9d9` | 4.5:1 |
  | `orange` | Orange | `#f48e00` | `#9f5c00` (35%) | `#fdeed9` | 4.6:1 |
  | `yellow` | Gul | `#f4ec00` | `#7a7600` (50%) | `#fdfcd9` | 4.6:1 |
  | `green` | Grøn | `#62f400` | `#317a00` (50%) | `#e7fdd9` | 5.0:1 |
  | `teal` | Turkis | `#00f4ec` | `#007a76` (50%) | `#d9fdfc` | 4.8:1 |
  | `blue` | Blå | `#0076f4` | `#0064cf` (15%) | `#d9eafd` | 4.6:1 |
  | `purple` | Lilla | `#9200f4` | `#9200f4` (already dark enough) | `#efd9fd` | 4.5:1 |
  | `pink` | Pink | `#f40086` | `#c3006b` (20%) | `#fdd9ed` | 4.6:1 |

  The built-in categories follow the same rule: Fejl → red, Forslag → yellow, Generel feedback →
  teal. Their icons change from today's colours (`#be3f59`, `#9a6700`, `#0f766e`) to the shades
  above. The old `.category-badge--bug/idea/general` classes and `--category-bug/idea/general-bg`
  tokens are removed.
- **Rationale**: The user gave the eight colours and decided that the icon uses a darker shade of
  the chosen colour on a lighter tint of it (2026-11-25). The exact shade and tint were left to
  us. Using the bright colours directly for the icon gave 1.2:1 to 3.5:1 against the tint, so
  yellow, green, teal and orange icons were nearly invisible.
- **Alternatives considered**: the bright colour as the icon (too little contrast, see above); a
  fixed darkening for all colours (yellow and teal need 50%, red only 20%; one fixed amount would
  make some icons nearly black).

## R8. The dialog (FR-004 to FR-012)

- **Decision**: A native `<dialog>` opened with `showModal()`. That gives, from the browser: the
  page behind becomes inert (FR-011), Tab stays inside, Escape closes it (the `cancel` event),
  it is announced as a dialog named by its title (`aria-labelledby`), and the `::backdrop` covers
  the page. Clicking the backdrop is detected as a click whose target is the `<dialog>` element
  itself. On close, `CategorySettings` moves focus back to the "Tilføj ny kategori" button
  (FR-011). The content is a `<form>`; "Tilføj kategori" is its submit button, so Enter in the
  name field submits, and does nothing while the button is disabled (FR-006, FR-008). The dialog
  is rendered only while open, so each opening starts empty (Story 2, scenario 4).
- **Rationale**: The platform already provides the focus trap and inert background; no new
  dependency (Constitution IV).
- **Testing note**: jsdom 29 has `HTMLDialogElement` but not `showModal()`/`close()`.
  `vitest.setup.ts` adds two small stubs that set and clear `open` and fire `close`. Inert
  background and the Tab trap cannot be checked in jsdom and are checked by hand in
  [quickstart.md](quickstart.md).
- **Alternatives considered**: a `div role="dialog"` with our own focus trap and `inert` on the
  app shell (more code, easy to get wrong); a dialog library (new dependency).

## R9. Choosing an icon and a colour (FR-019, FR-020, FR-021)

- **Decision**: Two `<fieldset>`s with a `<legend>` ("Kategori-ikon", "Kategorifarve"), each a
  group of native radio inputs, visually hidden and wrapped in a `<label>` styled as the design's
  icon button or colour circle. `:checked` styles the chosen one (brand border and soft brand
  background for icons, a brand ring for colours; existing tokens). Nothing is checked when the
  dialog opens (FR-005). Colour labels are visually hidden Danish names.
- **Rationale**: Radio inputs give "one at a time", arrow-key movement, and a chosen state that
  screen readers announce, without any ARIA code.
- **Alternatives considered**: buttons with `aria-pressed` (no arrow keys, and "one at a time" is
  ours to enforce).

## R10. The on/off switch (FR-016)

- **Decision**: A `<button role="switch" aria-checked>` in `CategoryRow`, named by the category
  name, calling `onToggle`. Styles from the design: brand track when on; white track, border and
  dark knob when off (existing tokens), sizes from Figma.
- **Rationale**: Space and Enter work on a button by default; `role="switch"` makes screen
  readers say "on"/"off" (Story 3, scenario 5).
- **Alternatives considered**: a checkbox styled as a switch (announced as "checked", not "on").

## R11. The inbox (FR-017, FR-018)

- **Decision**: `Inbox` also reads `useCategoriesStore` and passes the categories down:
  - `Toolbar` builds its category options from them (all categories, on or off, in list order),
    instead of the fixed `CATEGORY_OPTIONS`. `CategoryFilter` becomes `"all" | Category["_id"]`.
  - `TicketList` passes each ticket's category to `TicketRow`, which draws its icon and colour
    from the category instead of three hard-coded cases.
  - `TicketDetail` gets the ticket's category and shows its name in the chip; the small bug icon
    stays for Fejl only (spec 001, FR-012).

  `CATEGORY_LABELS` in `lib/inbox/format.ts` is removed; names come from the category data. The
  on/off state is not used by the inbox.
- **Rationale**: One source for names, icons and colours. Inbox stays the only inbox component
  that reads stores.
- **Alternatives considered**: `TicketRow` reading the store itself (breaks the prop-driven rule
  for the inbox's children).

## R12. Hidden page (Cache Components)

- **Decision**: As in `Inbox`, `CategorySettings` closes the dialog in a `useLayoutEffect`
  cleanup, so a page hidden by Next.js with `<Activity>` shows no open dialog on return.
- **Rationale**: Same rule as the inbox's view state (spec 003, FR-015). In practice the admin
  cannot leave while the dialog is open (the page behind is inert), so this is a safeguard.

## R13. Layout (FR-001)

- **Decision**: The settings page keeps its heading, adds the subtitle, and renders
  `CategorySettings`. New CSS in `globals.css`: the card header (title, subtitle, button, which
  moves under the title below `sm` as in the mobile design), the category row, the switch, the
  dialog, the icon grid (four per row) and the colour row. Sizes and spacing come from Figma;
  colours from existing tokens plus R7.
- **Inputs from Figma**: dialog width, padding, radius and shadow; row height and padding; switch
  size; icon-button and swatch size; the primary button colour (or an existing token if it
  matches).
