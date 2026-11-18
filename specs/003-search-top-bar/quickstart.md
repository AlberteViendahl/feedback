# Quickstart: Validate the Search Top Bar

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to prove the feature works once it is implemented. The details are in
[data-model.md](data-model.md) and [contracts/components.md](contracts/components.md).

## 1. Automated checks (Constitution quality gate)

From `apps/admin`:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

All four must pass. The test suite covers at least:

| Area | What the tests prove | Spec reference |
|------|----------------------|----------------|
| `lib/inbox/search` | words are split on whitespace and lowercased; empty or space-only text gives no words; each searched detail matches on its own (text beyond the first line, "#FB-…" number, name, email, company, platform name, page path); browser/OS/attachments do not match; every word must match; `*`, `.`, `(` and `<b>` match literally; "Ø" matches "ø" but not "oe"; a sender without a name still matches by email; filtering 1,000 tickets takes well under 0.2 s | FR-007–FR-009, SC-001, SC-003 |
| `lib/inbox/state` | the initial view has `search: ""`; `setSearch` changes only `search`; `reset` returns the initial view | FR-015 |
| `lib/inbox/select` | the search combines with the category, All/Done and sort; counts follow category and search; a selected ticket hidden by the search gives `null` and returns when the search is cleared | FR-010, FR-012, SC-002 |
| `SearchBar` | role `search` holding a `searchbox` named "Søg i feedback" with the Danish placeholder; typing reports each value; Escape reports `""`; Enter reports nothing | FR-001, FR-006, FR-013, FR-016, FR-017 |
| `TicketList` | the empty message depends on `isSearching` | FR-011 |
| `Inbox` (with the provider) | typing narrows the list without Enter; filters and counts combine; the open ticket hides and returns; Escape restores the list; searching marks nothing as read; remounting the inbox, or hiding and showing it inside `<Activity>`, empties the search and resets the view | US1-1–8, FR-014, FR-015, SC-004 |
| Keyboard (`Inbox.keyboard.test.tsx`, updated) | Tab reaches the search field first, then the existing toolbar controls; the rest of the order is unchanged | FR-016, SC-007 |

The existing inbox, side-menu and app-shell tests must still pass. In particular, the menu
counts do not change while searching (spec 002, FR-006).

## 2. Run the app

```bash
cd apps/admin
npm run dev
```

Open <http://localhost:3000/>. If styles look stale after the CSS change, change the file's
contents rather than `touch`ing it (spec 002 lesson), or restart `next dev`.

## 3. Manual checks with the mock data

Type each search and compare the list. Expected results were checked against
`lib/mock-feedback.ts` (research R2).

| Search | Expected list | Checks |
|--------|---------------|--------|
| `anna` | #FB-1042 (anna@company.dk) and #FB-1030 (nanna@friis.dk) | US1-1 |
| `/keywords` | #FB-1041, #FB-1036, #FB-1030 | US1-2 |
| `CSV`, then `csv` | #FB-1041 both times | US1-3 |
| `anna overview` | #FB-1042 only | US1-4 |
| `1042`, `FB-1042`, `#FB-1042` | #FB-1042 | edge case: ticket number |
| `mørk`, then `MØRK` | #FB-1033 | edge case: Danish letters |
| `<img` | #FB-1034, with its text still shown as plain text | edge case: special characters, Principle III |
| `a.b` | "Ingen feedback matcher søgningen." | US1-6, FR-009 |
| `   ` (spaces only) | all tickets, no message | edge case: only spaces |

Then:

1. Turn on "Færdig" and search `simpleserp`. The list shows #FB-1036, #FB-1030 and #FB-1028,
   and the switch reads "Alle 7 · Færdig 3". Now choose category "Fejl". The list shows #FB-1036
   and #FB-1028, and the counts follow (US1-5).
2. Open #FB-1042, then search `csv`. The detail panel shows "Vælg en feedback i listen for at se
   detaljerne.". Press Escape: the full list returns and #FB-1042 is open again. The filters and
   sort order are unchanged (US1-7, US1-8, SC-004).
3. Note the side menu counts, search for an unread ticket, and check that the counts are still
   the same. Open the ticket: the counts drop by one (FR-014, edge case).
4. Press Enter in the field. The page does not reload and the text stays (FR-006).
5. Search something, go to "Indstillinger", then come back. The field is empty and all tickets
   are shown. Reload: the field is still empty (FR-015).

## 4. Layout and design checks

| Window width | Expected | Checks |
|--------------|----------|--------|
| 1440px | The bar spans from the side menu to the window edge, 63px high, with a line along its bottom. The field is 420px wide, 32px from the menu. It matches [design/top-bar.png](design/top-bar.png) and [the page design](../002-side-menu/design/page-workspace.png), apart from the Danish wording | FR-001, FR-002, SC-005 |
| 1024px and 2560px | The bar still spans the full width and the field is still 420px | US2-2, SC-006 |
| 834px | The field sits directly under the menu-button bar, 24px from both edges, in one white band with no line. It matches [the tablet design](../002-side-menu/design/page-tablet.png) | FR-003, SC-005 |
| 390px and 320px | The field fills the width minus 24px margins; there is no horizontal scrolling. A long search scrolls inside the field | FR-004, US2-4, SC-006 |
| < 1024px, menu open | Tab cannot reach the search field | edge case; spec 002 FR-021 |
| Settings and a platform page | No visible search bar. The hidden inbox stays in the DOM with `display: none` (research R9), so check visibility, not presence | FR-005 |

Check the narrow-window values against Figma node `356:435` when the Figma MCP limit allows
(research R7).

## 5. Keyboard and screen reader

1. Load `/` and press Tab. Focus goes through the side menu first ("Feedback · Admin",
   Organic Growth, GEOtracking, SimpleSERP, Indstillinger, Log ud), then lands on the search
   field with the visible focus outline.
2. Type a search, then press Escape. The field empties and focus stays in it.
3. Press Tab. Focus moves on to "Alle …", then through the toolbar and into the results (SC-007).
4. With VoiceOver (macOS: ⌘F5), the field is announced as a search field named
   "Søg i feedback", inside a search landmark (FR-016).
