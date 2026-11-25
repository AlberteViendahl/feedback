# Implementation Plan: Add Ticket Category

**Branch**: `006-add-ticket-category` | **Date**: 2026-11-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-add-ticket-category/spec.md`

## Summary

Give the settings page a Categories card where the admin can add a category (name, icon, colour)
in a dialog and switch categories on or off. New categories also appear in the inbox's category
filter and are drawn with their icon and colour like the built-in ones.

Technical approach:

- **Components** (as asked): `CategorySettings`, with `CategoryRow` rendered in a loop and
  `AddCategoryModal` as sub-components; no others
  ([R1](research.md#r1-component-structure)).
- **State**: a new Zustand store, `useCategoriesStore`, seeded from `mockCategories`, with a pure
  reducer and the same session rules as tickets
  ([R2](research.md#r2-category-store), [R3](research.md#r3-session-lifetime-fr-014)).
- **Types**: a new `Category`; `Feedback.category` becomes a category id, keeping `bug`, `idea`
  and `general` ([R4](research.md#r4-category-identity-and-the-feedback-type-constitution-ii)).
- **Dialog**: native `<dialog>` with `showModal()` for the focus trap, inert page and Escape;
  radio groups for icon and colour; `role="switch"` buttons for on/off
  ([R8](research.md#r8-the-dialog-fr-004-to-fr-012)–[R10](research.md#r10-the-onoff-switch-fr-016)).
- **Look**: seven existing icons via a lookup map; eight colours given by the user, each with a
  darker shade for the icon (at least 4.5:1) and a 15% tint behind it. The built-in categories become red, yellow and teal
  ([R6](research.md#r6-icons-fr-015-fr-019), [R7](research.md#r7-colours-fr-015-fr-020)).
- **Inbox**: `Inbox` passes the categories to `Toolbar`, `TicketList`/`TicketRow` and
  `TicketDetail`; `CATEGORY_LABELS` goes away ([R11](research.md#r11-the-inbox-fr-017-fr-018)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), React 19.3.0, Node 24

**Primary Dependencies**: Next.js 16.4.6 (App Router, `cacheComponents`), Tailwind CSS 4.3.3,
Zustand 5.1.0. No new dependencies.

**Storage**: None. Categories live in a Zustand store seeded from mock data, for the session only.

**Testing**: Vitest, Testing Library, user-event, jsdom 29 (existing). jsdom lacks
`HTMLDialogElement.showModal()`/`close()`; `vitest.setup.ts` stubs them (R8).

**Target Platform**: Same browsers and widths as earlier specs: desktop, tablet and mobile.

**Project Type**: Web application (admin dashboard in a monorepo).

**Performance Goals**: A handful of categories; no measurable cost.

**Constraints**:

- No clock or random reads during render (Cache Components); ids and times are read in event
  handlers.
- Category names are untrusted text (Constitution III).
- Colours, sizes and spacing from Figma or the user via `globals.css` tokens (Constitution I).

**Scale/Scope**: Three new components, one new store (state, store, mock data), one new type, a
lookup map for icons, two icons switched to `currentColor`, five inbox components updated, CSS
for the card, rows, switch, dialog and colours.

**Colours**: the eight category colours were given by the user; the icon shades and tints are
derived from them (R7).

**Inputs from Figma** (needed before the CSS tasks; file `Tw9qt246dOOdNdSOMXx65z`, as in earlier
specs): dialog width, padding, radius and shadow; icon-button and swatch size; row height; switch
size; the primary button colour.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
| --------- | ----- | ------ |
| I. Design Fidelity | Screenshots in `design/`; existing tokens reused; category colours given by the user and added as tokens; other missing values come from Figma (listed above); Danish text, with three texts deliberately reworded (spec Assumptions). | Pass |
| II. Single Source of Data Types | `Category`, `CategoryIcon`, `CategoryColor` added to `lib/types.ts` only; `FeedbackCategory` removed; `Feedback.category` becomes `Category["_id"]`, mirroring a planned `categories` table. | Pass |
| III. Untrusted Feedback Content | Category names are rendered as text only; a test checks markup in a name stays text. No `dangerouslySetInnerHTML`. | Pass |
| IV. Simplicity | No new dependencies; native `<dialog>` and radio inputs; no extra components; `ResetTickets` reused for the log-out reset. | Pass |
| V. Small, Prop-Driven Components | `CategoryRow` and `AddCategoryModal` get data and callbacks via props. `CategorySettings` reads the store, as `Inbox` and `SideMenu` do since the container merges. Only `lib/categories/store.ts` imports the mock data, as the ticket store does. | Pass |
| VI. Tested Logic and Components | Tests for the reducer, validation, store, all three components, the inbox changes and the settings page ([quickstart.md](quickstart.md)). | Pass |

**Post-design re-check**: Pass. The design adds no dependency. Visible changes outside the
settings page: the inbox's category filter gains new categories, and the built-in category icons
in the ticket list take the new red, yellow and teal shades (the user's colour decision, R7).
`LightbulbIcon` and `MessageIcon` take `currentColor` so the colour can come from CSS.

## Project Structure

### Documentation (this feature)

```text
specs/006-add-ticket-category/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/category-settings.md
├── design/              # desktop, tablet, mobile, categories-card, modal
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/admin/
├── app/
│   ├── globals.css                          # swatch, icon and tint tokens per colour,
│   │                                        # .category-badge--<colour>;
│   │                                        # card header, row, switch, dialog, icon grid,
│   │                                        # swatches (values from Figma)
│   └── (admin)/settings/
│       ├── page.tsx                         # subtitle + <CategorySettings />
│       └── page.test.tsx                    # updated
├── components/
│   ├── Icons/
│   │   ├── LightbulbIcon.tsx                # stroke → currentColor
│   │   ├── MessageIcon.tsx                  # stroke → currentColor
│   │   └── category-icons.ts                # new: CATEGORY_ICONS, CATEGORY_COLOR_LABELS
│   ├── category-settings/                   # new
│   │   ├── CategorySettings.tsx (+ test)
│   │   ├── CategoryRow/CategoryRow.tsx (+ test)
│   │   └── AddCategoryModal/AddCategoryModal.tsx (+ test)
│   ├── ResetTickets/ResetTickets.tsx        # also calls resetCategories
│   └── inbox/
│       ├── Inbox.tsx (+ test)               # reads categories, passes them down
│       ├── Toolbar/Toolbar.tsx (+ test)     # options from categories
│       ├── TicketList/TicketList.tsx        # passes category to TicketRow
│       ├── TicketRow/TicketRow.tsx (+ test) # icon/colour from category
│       └── TicketDetail/TicketDetail.tsx (+ test) # chip name from category
├── lib/
│   ├── types.ts                             # Category, CategoryIcon, CategoryColor;
│   │                                        # Feedback.category: Category["_id"]
│   ├── mock-categories.ts                   # new
│   ├── categories/                          # new
│   │   ├── state.ts (+ test)                # reducer, validateCategoryName, getCategory
│   │   └── store.ts (+ test)                # useCategoriesStore and actions
│   └── inbox/
│       ├── state.ts                         # CategoryFilter: "all" | Category["_id"]
│       └── format.ts (+ test)               # CATEGORY_LABELS removed
├── vitest.setup.ts                          # resetCategories; showModal/close stubs
└── docs/architecture.md                     # level 3: settings page, category store
```

**Structure Decision**: Everything stays in `apps/admin`, following the existing split: pure
logic and stores in `lib/`, components in `components/<feature>/`, icons in `components/Icons/`.
The architecture docs are updated in the same change with the c4-architecture skill, as
`apps/admin/CLAUDE.md` requires; only the level 3 file changes, since no container is added.
Before writing the settings page, read the relevant guide in
`apps/admin/node_modules/next/dist/docs/` (`apps/admin/AGENTS.md`).

## Complexity Tracking

No violations.
