# Data Model: Add Ticket Category

Types live in `apps/admin/lib/types.ts` (Constitution II) and mirror a planned Convex
`categories` table.

## Category (new)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | `string` | `bug`, `idea`, `general` for the built-in categories; `crypto.randomUUID()` for new ones |
| `_creationTime` | `number` | Milliseconds since epoch; read in the event handler that adds it |
| `workspaceId` | `string` | The admin's workspace (`ws_organic_growth` in mock data) |
| `name` | `string` | Trimmed, 1–40 characters, unique in the workspace ignoring letter case. Untrusted: shown as text only |
| `icon` | `CategoryIcon` | `"lightbulb" \| "bug" \| "message" \| "inbox" \| "paperclip" \| "branch" \| "progress"` |
| `color` | `CategoryColor` | `"red" \| "orange" \| "yellow" \| "green" \| "teal" \| "blue" \| "purple" \| "pink"` |
| `isEnabled` | `boolean` | On = the (future) AI may choose this category. New categories start `true` |

Two categories may share an icon or a colour.

### Mock data (`lib/mock-categories.ts`)

| `_id` | `name` | `icon` | `color` | `isEnabled` |
| --- | --- | --- | --- | --- |
| `bug` | Fejl | `bug` | `red` | `true` |
| `idea` | Forslag | `lightbulb` | `yellow` | `true` |
| `general` | Generel feedback | `message` | `teal` | `true` |

Names and icons are today's; the colours follow the new rule (research R7), so the built-in icons
change colour.

## Feedback (changed)

| Field | Before | After |
| --- | --- | --- |
| `category` | `FeedbackCategory` (`"bug" \| "idea" \| "general"`) | `Category["_id"]` |

`FeedbackCategory` is removed. Mock tickets and test fixtures keep their values, because the
built-in category ids are unchanged.

## Category store state (`lib/categories/state.ts`)

```text
CategoriesState  = { categories: Category[] }          // list order = order added
CategoryAction   =
  | { type: "add"; category: Category }                 // ignored if the name is invalid
  | { type: "toggle"; id: string }                      // flips isEnabled; ignored for an unknown id
```

`resetCategories()` sets the store back to its initial state directly, like `resetTickets()`.

### Rules

| Rule | Where | Spec |
| --- | --- | --- |
| Name is trimmed before it is stored | reducer `add` | Story 4, scenario 4 |
| Empty or spaces-only name is rejected | `validateCategoryName` → `"empty"` | FR-008 |
| Name equal to an existing one ignoring case (`toLocaleLowerCase("da")`) and outer spaces is rejected | `validateCategoryName` → `"duplicate"` | FR-010 |
| At most 40 characters | `maxLength` on the field | FR-009 |
| New categories are added last, with `isEnabled: true` | reducer `add` | FR-006 |
| Toggling never touches tickets | separate store | FR-017 |

## Inbox view state (changed)

`CategoryFilter` changes from `"all" | FeedbackCategory` to `"all" | Category["_id"]`. Nothing
else in the view state changes.
