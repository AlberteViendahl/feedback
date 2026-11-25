# Quickstart: Add Ticket Category

How to check that the feature works. Contracts: [contracts/category-settings.md](contracts/category-settings.md);
data: [data-model.md](data-model.md).

## Automated checks

From `apps/admin`:

```sh
npm run lint
npx tsc --noEmit
npx vitest run
```

What the tests cover:

| Area | Covers | Spec |
| --- | --- | --- |
| `lib/categories/state.test.ts` | trim on add; empty, spaces-only and duplicate names (any case, Danish letters) rejected; new category added last and on; toggle flips one category only; unknown id ignored | FR-006, FR-008, FR-010, FR-016, Story 4 |
| `lib/categories/store.test.ts` | actions change the store; `resetCategories` restores the mock data | FR-014 |
| `CategoryRow.test.tsx` | name as text (markup stays text); switch announced with the name and on/off; pressing calls `onToggle` | FR-013, FR-016, Story 3 |
| `AddCategoryModal.test.tsx` | texts in Danish; name focused, nothing chosen on open; add disabled until name, icon and colour are chosen; Enter submits; duplicate message appears and goes away on edit; Annuller, ×, Escape and backdrop close without adding; 40-character limit; seven icons and eight colours with Danish names | FR-004 to FR-010, FR-019 to FR-021, Stories 1, 2, 4 |
| `CategorySettings.test.tsx` | lists Fejl, Forslag, Generel feedback, all on; full add flow puts the new category last with its icon and colour; cancel adds nothing and the next opening is empty; focus returns to the button | FR-001 to FR-003, FR-011, Stories 1–3 |
| `Inbox.test.tsx` (extended) | a category added in the store appears in the category filter; switching a category off changes nothing in the inbox | FR-017, FR-018 |
| `TicketRow` / `Toolbar` / `TicketDetail` tests (updated) | names and icons now come from the categories | FR-015 |
| `settings/page.test.tsx` (updated) | heading, subtitle and the Categories card | FR-001 |

## By hand

Run `npm run dev` in `apps/admin` and open `/settings`. jsdom cannot check these:

1. **Layout**: compare desktop, tablet and mobile widths with `design/desktop.png`,
   `design/tablet.png` and `design/mobile.png`. On mobile the "Tilføj ny kategori" button sits
   under the card title.
2. **Dialog**: press "Tilføj ny kategori". Compare with `design/modal.png`. The page behind is
   dimmed and cannot be clicked; Tab cycles only through the dialog's controls.
3. **Choosing**: click an icon and a colour; each is highlighted, and choosing another moves the
   highlight. Arrow keys move between icons and between colours.
4. **Add**: type "Forbedring", choose Indbakke and Blå, press "Tilføj kategori". The dialog
   closes, "Forbedring" is the last row with a blue inbox icon and its switch on, and focus is on
   "Tilføj ny kategori".
5. **Cancel four ways**: open the dialog, type a name, and close it with Annuller, ×, Escape and
   a click outside. Nothing is added each time; reopening shows an empty dialog.
6. **Duplicate**: try "  fejl  "; the dialog stays open and says the category exists.
7. **Inbox**: go to `/`; "Forbedring" is in the category filter, and choosing it shows "Ingen
   feedback matcher filtrene.". In the ticket list, Fejl icons are red, Forslag yellow and Generel
   feedback teal, each on a light tint of the same colour.
8. **Switch and session**: switch "Generel feedback" off, go to the inbox and back: still off.
   Log out via the user block and return: the three original categories, all on, are back.
9. **Screen reader** (VoiceOver): the dialog is announced with its title; switches say the
   category name and "on"/"off"; icon and colour choices say their Danish names and "selected".
