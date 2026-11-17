# Quickstart: Validate the Side Menu

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to prove the feature works once it is implemented. Details are in
[data-model.md](data-model.md) and [contracts/components.md](contracts/components.md).

## 1. Automated checks (Constitution quality gate)

From `apps/admin`:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

All must pass. The build must list `/`, `/platforms/geotracking`, `/platforms/simpleserp`,
`/settings` and `/logged-out` as prerendered, with no `blocking-prerender` errors (confirms
research R4/R5). The test suite covers at least:

| Area | What the tests prove | Spec reference |
|------|----------------------|----------------|
| `lib/tickets/state` | markRead, sendReply (once, trimmed, → done), createIssue (once, done stays done); no-ops return the same array | FR-006, FR-017 |
| `lib/tickets/counts` | counts per platform and total from unread tickets; zero platforms present | FR-005, SC-003 |
| `lib/side-menu/active-href` | exact matches for `/`, platform and settings URLs; `null` otherwise | FR-010, SC-002 |
| `lib/platforms` | `isPlatform` accepts known ids only | edge case: unknown platform |
| `lib/inbox/*` | the inbox's existing tests, adapted to the split state | spec 001 |
| `SideMenu`, `NavItem`, `UserBlock` | all items and texts, "1 ny"/"{n} nye", zero hidden, one active item with `aria-current="page"`, log-out link `/logged-out` labelled "Log ud" | FR-002–FR-015 |
| Menu + inbox together | opening an unread ticket lowers the counts immediately; ticket changes survive remounting the inbox while filters and selection reset | US1-5/6/7, SC-007 |
| Keyboard | Tab reaches every menu item and the log-out link in order; Enter follows them | FR-014, SC-006 |
| Pages and layout | platform page renders its name, rejects unknown ids with `notFound()`, lists both platforms for prerendering; settings, not-found and logged-out pages render their heading and link; the admin layout puts the menu in the sticky `aside` and the page in `main` | FR-001, FR-008, FR-009, FR-013, US2-2/3, US3-2/3 |

## 2. Run the app

```bash
cd apps/admin
npm run dev
```

Open http://localhost:3000 and check:

1. **Menu on every page**: the menu runs the full window height on `/`, `/platforms/geotracking`,
   `/platforms/simpleserp` and `/settings`. Scroll the inbox page: the menu stays put and
   "Indstillinger" and the user block stay visible (FR-001).
2. **Contents**: "Feedback · Admin", "Organic Growth" with "4 nye", "Platforme", GEOtracking
   "3 nye", SimpleSERP "1 ny", "Indstillinger", a line, then "H", "Hussein", "Admin · Organic
   Growth" and the log-out icon.
3. **Navigation and highlight**: click each item; the right page opens, its heading names the
   page, and only the clicked item is highlighted. Reload each page: the highlight stays (FR-011).
4. **Live counts**: on `/`, open an unread GEOtracking ticket → GEOtracking drops to "2 nye" and
   the workspace to "3 nye" at once.
5. **State across pages**: send a reply on a ticket and set the "Færdig" filter, go to
   "Indstillinger" and back → the reply is still sent, the filter is back to "Alle", no ticket is
   open.
6. **Not found**: open `/platforms/foo` → "Siden findes ikke" with the menu, nothing highlighted.
7. **Log out**: click the log-out icon → "Du er logget ud" without the menu, no confirmation.
   Click "Log ind igen" → the inbox with the menu and the original mock counts.
8. **Keyboard only**: Tab through the whole menu, including the log-out link; each focused item
   shows the focus outline; Enter follows the link.
9. **Visual comparison**: compare with [design/side-menu.png](design/side-menu.png) and the three
   page screenshots in [design/](design/). Allowed differences: Danish wording, lower counts, and
   the search bar and page headers, which are separate features.
