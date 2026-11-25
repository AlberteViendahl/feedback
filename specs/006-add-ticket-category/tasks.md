---

description: "Task list for adding ticket categories"
---

# Tasks: Add Ticket Category

**Input**: Design documents from `/specs/006-add-ticket-category/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/category-settings.md,
quickstart.md

**Tests**: Included. Constitution VI requires tests for new logic and components in the same
change.

**Organization**: Tasks are grouped by user story so each story can be built and tested on its
own.

All paths are relative to `apps/admin/` unless they start with `specs/`. Run commands from
`apps/admin/`.

**Figma** (file `Tw9qt246dOOdNdSOMXx65z`, page "Endelig design"). Load the
`figma:figma-design-to-code` skill before calling `get_design_context`. Nodes:

| What | Node |
| --- | --- |
| Settings page, desktop / tablet / mobile | `323:1451` / `356:605` / `356:587` |
| Categories card, desktop / tablet / mobile | `323:1459` / `356:621` / `356:603` |
| Card header, tablet / mobile | `356:1411` / `356:1325` |
| Category row (tablet) | `356:1418` |
| Toggle (56 × 28) | `323:1467` |
| Add new category modal (480 × 524) | `415:533` |
| Name input / Add category button / Close button | `415:537` / `415:545` / `415:557` |
| Icon picker | `420:2582` |

The eight category colours are fixed by the user, not by Figma (research R7).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1–US4)

---

## Phase 1: Setup (types, icons, colours, test environment)

**Purpose**: The category types, everything the stories draw with, and dialog support in jsdom.

- [X] T001 Read `specs/006-add-ticket-category/data-model.md` and `contracts/category-settings.md` before starting
- [X] T002 In `lib/types.ts`: add `CategoryIcon` (`"lightbulb" | "bug" | "message" | "inbox" | "paperclip" | "branch" | "progress"`), `CategoryColor` (`"red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"`) and `Category` (`_id`, `_creationTime`, `workspaceId`, `name` with the comment "Untrusted user input: always render as plain text.", `icon`, `color`, `isEnabled` with the comment "On: the (future) AI may choose this category. Spec 006."), with a comment that it mirrors a planned Convex `categories` table. Remove `FeedbackCategory`; change `Feedback.category` to `Category["_id"]` with the comment "The category's `_id`; becomes `categoryId: Id<\"categories\">` with Convex (spec 006, research R4)."
- [X] T003 [P] In `components/Icons/LightbulbIcon.tsx` replace `stroke="#9A6700"` with `stroke="currentColor"`, and in `components/Icons/MessageIcon.tsx` replace `stroke="#0F766E"` with `stroke="currentColor"` (research R6). Nothing else in the files changes
- [X] T004 [P] Create `components/Icons/category-icons.ts` exporting `CATEGORY_ICONS: Record<CategoryIcon, { Icon: ComponentType<SvgIconProps>; label: string }>` in this order: `lightbulb` → `LightbulbIcon`, "Idé"; `bug` → `BugIcon`, "Fejl"; `message` → `MessageIcon`, "Besked"; `inbox` → `InboxIcon`, "Indbakke"; `paperclip` → `PaperclipIcon`, "Vedhæftning"; `branch` → `BranchIcon`, "Forgrening"; `progress` → `ProgressIcon`, "Fremskridt". Also export `CATEGORY_COLOR_LABELS: Record<CategoryColor, string>`: red "Rød", orange "Orange", yellow "Gul", green "Grøn", teal "Turkis", blue "Blå", purple "Lilla", pink "Pink". Import the types from `@/lib/types`
- [X] T005 [P] In `app/globals.css` `:root`, replace the three `--category-bug-bg`/`--category-idea-bg`/`--category-general-bg` tokens with 24 tokens under the comment `/* Category colours (spec 006, research R7): swatch, icon, tint */`: for each of red, orange, yellow, green, teal, blue, purple, pink add `--category-<c>`, `--category-<c>-fg`, `--category-<c>-bg` with these values — red `#ff0000` `#cc0000` `#ffd9d9`; orange `#f48e00` `#9f5c00` `#fdeed9`; yellow `#f4ec00` `#7a7600` `#fdfcd9`; green `#62f400` `#317a00` `#e7fdd9`; teal `#00f4ec` `#007a76` `#d9fdfc`; blue `#0076f4` `#0064cf` `#d9eafd`; purple `#9200f4` `#9200f4` `#efd9fd`; pink `#f40086` `#c3006b` `#fdd9ed`. In `@layer components`, replace `.category-badge--bug/--idea/--general` with eight classes `.category-badge--<c> { background: var(--category-<c>-bg); color: var(--category-<c>-fg); }`
- [X] T006 [P] In `vitest.setup.ts`, before `afterEach`, add jsdom stubs (research R8, with a comment saying jsdom 29 lacks them): if `HTMLDialogElement.prototype.showModal` is missing, define it to set `this.open = true`; if `close` is missing, define it to set `this.open = false` and dispatch `new Event("close")`

**Checkpoint**: `npx vitest run components/Icons` passes.

---

## Phase 2: Foundational (category data and the inbox switch-over)

**Purpose**: The category store, and the inbox reading names, icons and colours from it. Every story depends on this. After this phase the app looks the same except the inbox's
category icons use the new colours.

- [X] T007 [P] Create `lib/mock-categories.ts` exporting `mockCategories: Category[]` with the three rows from `data-model.md` (`bug`/Fejl/`bug`/`red`, `idea`/Forslag/`lightbulb`/`yellow`, `general`/Generel feedback/`message`/`teal`, all `isEnabled: true`, `workspaceId: "ws_organic_growth"`, fixed `_creationTime` values in the past). Header comment: "Mock data until the Convex backend exists. Only lib/categories/store.ts imports this." (depends on T002)
- [X] T008 [P] Create `lib/categories/state.ts` with `CategoryAction` (`{ type: "add"; category: Category } | { type: "toggle"; id: string }`), `validateCategoryName(name, categories): "empty" | "duplicate" | null` (trim; `"empty"` if blank; `"duplicate"` if any category's `name.trim().toLocaleLowerCase("da")` equals the trimmed name's), `categoriesReducer(categories, action)` (`add`: ignore when `validateCategoryName` is not `null`, otherwise append with the name trimmed; `toggle`: flip `isEnabled` of the matching `_id`, return the same array for an unknown id) and `getCategory(categories, id)`. Write `lib/categories/state.test.ts` first: trims on add; rejects "", "   ", "fejl", " FEJL ", and "ØL" when "øl" exists; appends last; toggle flips only the target; unknown id returns the same array; `getCategory` finds and misses (depends on T002)
- [X] T009 Create `lib/categories/store.ts` modelled on `lib/tickets/store.ts`: `useCategoriesStore = create<{ categories: Category[] }>()(() => ({ categories: mockCategories }))`; `addCategory({ name, icon, color })` builds a `Category` with `_id: crypto.randomUUID()`, `_creationTime: Date.now()`, `workspaceId` from the first existing category (or `"ws_organic_growth"`), `isEnabled: true`, and applies `add`; `toggleCategory(id)`; `resetCategories()` restores `getInitialState()`. Doc comment: client-only, select `state.categories` only, never called while rendering. Write `lib/categories/store.test.ts`: add appends with a fresh id and `isEnabled: true`; toggle; reset brings back the three mock categories (depends on T007, T008)
- [X] T010 [P] In `vitest.setup.ts`, call `resetCategories()` next to `resetTickets()` in `afterEach` (depends on T009)
- [X] T011 [P] In `components/ResetTickets/ResetTickets.tsx`, call `resetCategories()` in the same effect as `resetTickets()` and update the comment to "Clears the session's ticket and category changes…" (FR-014, research R3) (depends on T009)
- [X] T012 In `lib/inbox/state.ts`, change `CategoryFilter` to `"all" | Category["_id"]` (depends on T002)
- [X] T013 In `lib/inbox/format.ts`, remove `CATEGORY_LABELS` and its `FeedbackCategory` import; remove its test in `lib/inbox/format.test.ts` (depends on T002)
- [X] T014 In `components/inbox/Toolbar/Toolbar.tsx`, add the prop `categories: Category[]`; build the options as "Alle" plus one `{ value: category._id, label: category.name }` per category in list order, replacing `CATEGORY_OPTIONS`; `isCategoryFilter` accepts `"all"` or any category id in the list. Update `components/inbox/Toolbar/Toolbar.test.tsx` to pass `mockCategories`-like categories (depends on T012)
- [X] T015 [P] In `components/inbox/TicketRow/TicketRow.tsx`, add the prop `category: Category | undefined`; replace the three hard-coded icons with `CATEGORY_ICONS[category.icon].Icon` labelled `category.name` inside `<span className={\`category-badge category-badge--${category.color}\`}>`; render no badge when `category` is undefined. Pass the category in `components/inbox/TicketList/TicketList.tsx` via a new `categories: Category[]` prop and `getCategory`. Update `TicketRow`/`TicketList` tests to pass categories (depends on T004, T005, T008)
- [X] T016 [P] In `components/inbox/TicketDetail/TicketDetail.tsx`, add the prop `category: Category | undefined`; the chip shows `category?.name` instead of `CATEGORY_LABELS[...]`; keep the small `BugIcon` only when `ticket.category === "bug"` (spec 001, FR-012). Update its test (depends on T008)
- [X] T017 In `components/inbox/Inbox.tsx`, read `const categories = useCategoriesStore((state) => state.categories)`; pass `categories` to `Toolbar` and `TicketList`, and `getCategory(categories, selected.category)` to `TicketDetail` (depends on T009, T014–T016)
- [X] T018 Run `npx tsc --noEmit` and `npx vitest run`; fix any remaining use of `FeedbackCategory` or `CATEGORY_LABELS` (`grep -rn "FeedbackCategory\|CATEGORY_LABELS" app components lib`)

**Checkpoint**: Type check and all tests pass. The inbox shows the same names; Fejl icons are
red, Forslag yellow, Generel feedback teal.

---

## Phase 3: User Story 1 – Add a new category (Priority: P1) 🎯 MVP

**Goal**: Settings shows the Categories card; the admin adds a category with name, icon and
colour, and it appears last in the list and in the inbox filter.

**Independent Test**: Open `/settings`, add "Forbedring" with Indbakke and Blå, and see it last
in the list with a blue inbox icon, and in the inbox's category filter.

- [X] T019 [US1] Read `node_modules/next/dist/docs/` guides on Server and Client Components and on `page.tsx` (per `AGENTS.md`) before editing the settings page
- [X] T020 [P] [US1] In `app/globals.css` `@layer components`, add classes for the Categories card from Figma `323:1459`, `356:1411`, `356:1325` and `356:1418` (`get_design_context`): `.settings-card__header` (title, subtitle and button in a row; below `sm`, button under the title as in `356:1325`), `.settings-card__list` (list reset), `.category-row` (icon badge, name, then the switch at the right; row height and padding from `356:1418`, dividers with `--divider-color-soft`), and `.button--soft` for "Tilføj ny kategori" (brand-soft background, brand text, from `323:1459`). Reuse `.card`, `.text-title`, `.text-subtitle`, `.category-badge`. Any value not in `:root` goes in as a token with a `/* Figma <node> */` comment
- [X] T021 [P] [US1] In `app/globals.css`, add classes for the dialog from Figma `415:533`, `415:537`, `415:545`, `415:557` and `420:2582`: `.modal` (the `<dialog>`: width, padding, radius, shadow, no default border), `.modal::backdrop` (use `--backdrop`), `.modal__header`, `.modal__footer` (divider above, buttons right), `.text-input` (name field), `.icon-choices` (grid of four per row), `.icon-choice` (label styled as a button; `:has(input:checked)` → brand border, `--brand-soft` background, `--brand-text` text, as the highlighted "Idea" in the design), `.color-choices` (row of eight), `.color-choice` (circle filled with `var(--swatch)`; `:has(input:checked)` → 2px brand ring), `.button--primary` (brand background, white text), and `.visually-hidden` if it does not exist. Inputs inside choices are visually hidden but focusable; show `:focus-visible` on the label via `:has(input:focus-visible)`
- [X] T022 [P] [US1] Create `components/category-settings/CategoryRow/CategoryRow.tsx` per the contract, without the switch yet (US3 adds it): an `<li className="category-row">` with the icon (`CATEGORY_ICONS[category.icon].Icon`, decorative) in `.category-badge category-badge--${category.color}` and the name as text. Write `CategoryRow.test.tsx` first: shows the name; badge has the colour class; `<b>Forbedring</b>` as a name renders as that literal text with no `<b>` element (FR-013)
- [X] T023 [US1] Create `components/category-settings/AddCategoryModal/AddCategoryModal.tsx` (`"use client"`) per the contract: a `<dialog className="modal" aria-labelledby={titleId}>` whose ref calls `showModal()` in an effect on mount; title "Tilføj ny kategori"; description "Giv AI'en en ny måde at sortere feedback på."; a `<form>` with the name `<input>` (label "Kategorinavn", placeholder "f.eks. Forbedring", `maxLength={40}`, `autoFocus`, helper "AI'en kan vælge kategorien, når den sorterer feedback." linked via `aria-describedby`); a `<fieldset>` with legend "Kategori-ikon" and hint "Vælg én" containing seven radio inputs (`name="icon"`) from `CATEGORY_ICONS`, each in a `<label className="icon-choice">` with the icon and its Danish name; a `<fieldset>` with legend "Kategorifarve" containing eight radio inputs (`name="color"`) in `<label className="color-choice" style={{ "--swatch": \`var(--category-${color})\` }}>` with a `.visually-hidden` Danish name; a submit button "Tilføj kategori" (`.button.button--primary`), disabled while `validateCategoryName(name, categories) === "empty"` or icon or colour is `null`. On submit: `preventDefault`; call `onAdd({ name: name.trim(), icon, color })`. Keep `name`, `icon`, `color` in `useState` (icon and colour start `null`) (depends on T004, T008)
- [X] T024 [US1] Write `components/category-settings/AddCategoryModal/AddCategoryModal.test.tsx` for US1: Danish title, description, label, placeholder, helper and legends; name field focused and no radio checked on open; seven icon radios named Idé, Fejl, Besked, Indbakke, Vedhæftning, Forgrening, Fremskridt and eight colour radios named Rød … Pink; choosing an icon checks it and choosing another moves the check; "Tilføj kategori" disabled until name, icon and colour are all chosen; clicking it, or Enter in the field, calls `onAdd` with the trimmed name, icon and colour (depends on T006, T023)
- [X] T025 [US1] Create `components/category-settings/CategorySettings.tsx` (`"use client"`) per the contract: reads `useCategoriesStore((state) => state.categories)`; renders `<section className="card" aria-labelledby=…>` with the header (title "Kategorier", subtitle "Det AI'en kan sortere feedback i", a `.button.button--soft` "Tilføj ny kategori" with a plus, `ref` kept for focus), and `<ul className="settings-card__list">` with `categories.map((category) => <CategoryRow key={category._id} category={category} />)`. `isAdding` state renders `<AddCategoryModal categories={categories} onAdd={(input) => { addCategory(input); close(); }} onClose={close} />` only while true; `close` sets `isAdding` false and focuses the button (depends on T009, T022, T023)
- [X] T026 [US1] In `app/(admin)/settings/page.tsx`, keep the `<h1 className="text-display">Indstillinger</h1>` and `metadata`; replace the placeholder text with `<p className="text-subtitle">Opsæt feedback-widget, kategorier, notifikationer og datahåndtering</p>` and `<CategorySettings />`, spaced as in Figma `323:1451`. Replace the placeholder comment with one pointing to spec 006. Update `app/(admin)/settings/page.test.tsx`: heading, subtitle and a region named "Kategorier" (depends on T025)
- [X] T027 [US1] Write `components/category-settings/CategorySettings.test.tsx` for US1: lists Fejl, Forslag, Generel feedback in that order; "Tilføj ny kategori" opens a dialog named "Tilføj ny kategori"; typing "Forbedring", choosing Indbakke and Blå and pressing "Tilføj kategori" closes the dialog and adds "Forbedring" as the last list item with `category-badge--blue`; focus is then on "Tilføj ny kategori" (FR-011) (depends on T025)
- [X] T028 [US1] Extend `components/inbox/Inbox.test.tsx`: after `addCategory({ name: "Forbedring", icon: "inbox", color: "blue" })`, the "Kategori" select has an option "Forbedring" after the existing three, and choosing it shows "Ingen feedback matcher filtrene." (FR-018) (depends on T017)

**Checkpoint**: Story 1 works on its own: `npx vitest run components/category-settings app` passes;
quickstart steps 1–4 and 7 pass by hand.

---

## Phase 4: User Story 2 – Change your mind (Priority: P1)

**Goal**: The dialog closes without adding anything via Annuller, ×, Escape or a click outside,
and opens empty next time.

**Independent Test**: Open the dialog, type a name, close it each of the four ways; the list is
unchanged and the dialog reopens empty.

- [X] T029 [US2] In `AddCategoryModal.tsx`: add "Annuller" (`type="button"`, `.button`) left of "Tilføj kategori" and a close button (`.icon-button`, `aria-label="Luk"`, the `close` icon from `@/components/Icons/Icon`) in the header, both calling `onClose`; handle the dialog's `cancel` event (Escape) with `preventDefault()` then `onClose()`; on `click` where `event.target === dialogRef.current` (backdrop) call `onClose()` (research R8)
- [X] T030 [US2] In `CategorySettings.tsx`, close the dialog when the page is hidden: `useLayoutEffect(() => () => setIsAdding(false), [])`, with the same comment style as `Inbox.tsx` (research R12)
- [X] T031 [US2] Add tests to `AddCategoryModal.test.tsx`: Annuller, the "Luk" button, a `cancel` event on the dialog and a click on the dialog element itself each call `onClose` and never `onAdd`; a click inside the form does not call `onClose` (depends on T029)
- [X] T032 [US2] Add tests to `CategorySettings.test.tsx`: after typing a name, choosing an icon and colour and pressing Annuller, the list still has three items and the dialog is gone; reopening shows an empty name and no checked radio; focus returns to "Tilføj ny kategori" (depends on T029, T030)

**Checkpoint**: Stories 1 and 2 pass; quickstart step 5 passes by hand.

---

## Phase 5: User Story 3 – Switch a category on or off (Priority: P2)

**Goal**: Each row has a working on/off switch; built-in and new categories start on; the inbox
is unaffected.

**Independent Test**: Switch "Generel feedback" off, go to the inbox and back: still off, other
categories unchanged, inbox unchanged.

- [X] T033 [P] [US3] In `app/globals.css`, add `.switch` from Figma `323:1467` (56 × 28): track and knob; `[aria-checked="true"]` → `--brand` track, white knob on the right; `[aria-checked="false"]` → `--surface` track, `--border-color` border, `--surface-inverse` knob on the left, as in the design. No transition values unless Figma has them
- [X] T034 [US3] In `CategoryRow.tsx`, add the prop `onToggle: (id: string) => void` and a `<button type="button" role="switch" className="switch" aria-checked={category.isEnabled} aria-label={category.name} onClick={() => onToggle(category._id)}>` at the end of the row. Pass `onToggle={toggleCategory}` from `CategorySettings.tsx` (depends on T022, T025)
- [X] T035 [US3] Add tests to `CategoryRow.test.tsx`: a switch named after the category, `aria-checked` follows `isEnabled`, clicking and pressing Space call `onToggle` with the id (depends on T034)
- [X] T036 [US3] Add tests to `CategorySettings.test.tsx`: all three switches start checked; a newly added category's switch is checked; clicking "Generel feedback"'s switch unchecks only it, and a fresh render of `CategorySettings` (same store) still shows it off (FR-016) (depends on T034)
- [X] T037 [US3] Add a test to `Inbox.test.tsx`: after `toggleCategory("bug")`, the Fejl tickets are still listed and "Fejl" is still an option in the "Kategori" select (FR-017) (depends on T017)

**Checkpoint**: Stories 1–3 pass; quickstart step 8 passes by hand.

---

## Phase 6: User Story 4 – Be stopped from adding a bad name (Priority: P2)

**Goal**: Blank, duplicate and too-long names are refused with a clear message.

**Independent Test**: Try "  fejl  " and an empty name; neither is added and the dialog says why.

- [X] T038 [US4] In `AddCategoryModal.tsx`, on submit: if `validateCategoryName` returns `"duplicate"`, set `showDuplicate` and do not call `onAdd`; render "Der findes allerede en kategori med det navn." in an element with `role="alert"`, and set `aria-invalid` and add its id to the field's `aria-describedby` while shown; clear `showDuplicate` on every name change (FR-010)
- [X] T039 [US4] Add tests to `AddCategoryModal.test.tsx`: "   " keeps the button disabled; with all three chosen, "  fejl  " shows the alert and does not call `onAdd`; editing the name hides it; the field has `maxLength` 40 and typing 41 characters leaves 40; "  Forbedring  " calls `onAdd` with "Forbedring" (FR-008 to FR-010, Story 4) (depends on T038)

**Checkpoint**: All stories pass; quickstart step 6 passes by hand.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T040 [P] Note in `specs/001-feedback-inbox/data-model.md` that `Feedback.category` is now a category id and categories live in their own store (spec 006), and in `specs/002-side-menu/contracts/components.md` that `/settings` is no longer a placeholder (spec 006), each as a short "Changed 2026-11-25" note like the earlier ones
- [X] T041 Run `npm run lint`, `npx tsc --noEmit` and `npx vitest run` in `apps/admin`; all must pass
- [ ] T042 Walk through `specs/006-add-ticket-category/quickstart.md` "By hand" steps 1–9 in `npm run dev`, at desktop, tablet and mobile widths, comparing with the screenshots in `specs/006-add-ticket-category/design/`
- [X] T043 Update the architecture docs to match the changes in this feature, using the c4-architecture skill (`docs/architecture.md` for levels 1–2, `apps/admin/docs/architecture.md` for level 3): add the settings page's Categories card (`CategorySettings`, `CategoryRow`, `AddCategoryModal`), the category store and its mock data, and the inbox reading categories; mark `/settings` as no longer a placeholder. Levels 1–2 do not change (no new container)

**Note**: The architecture-docs task is always the final task in every task list.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none; the type task comes first because the icon map and everything after use it.
- **Foundational (Phase 2)**: after Setup. Blocks every story, because the type change touches the
  inbox.
- **US1 (Phase 3)**: after Foundational.
- **US2 (Phase 4)**: after US1 (it extends `AddCategoryModal` and `CategorySettings`).
- **US3 (Phase 5)**: after Foundational and T022/T025 from US1 (the row and the list exist).
- **US4 (Phase 6)**: after US1 (it extends `AddCategoryModal`).
- **Polish (Phase 7)**: after all stories.

### Within Each Story

- Write the test file first (or alongside) and see it fail, then implement.
- CSS tasks marked [P] can run alongside component tasks.

### Parallel Opportunities

- Phase 1: T003, T004 (after T002), T005, T006.
- Phase 2: T007 and T008 after T002; T010 and T011 after T009; T015 and T016 together.
- US1: T020, T021 and T022 together.
- After US1: US3 and US4 can run in parallel (different parts of different files: `CategoryRow`
  vs `AddCategoryModal`), and US2 alongside US3.

---

## Parallel Example: User Story 1

```bash
Task: "Add Categories card CSS in app/globals.css (T020)"
Task: "Add dialog CSS in app/globals.css (T021)"   # same file: do one after the other if one agent
Task: "Create CategoryRow in components/category-settings/CategoryRow/CategoryRow.tsx (T022)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 and Phase 2: the inbox keeps working on the new category data.
2. Phase 3: the settings page can add categories.
3. **Stop and validate**: quickstart steps 1–4 and 7.

### Incremental Delivery

1. US1 → add categories (MVP).
2. US2 → every way out of the dialog.
3. US3 → on/off switches.
4. US4 → name validation messages.
5. Polish → docs, full check, architecture docs.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each phase
- Avoid: new components beyond the three in the plan (research R1)
