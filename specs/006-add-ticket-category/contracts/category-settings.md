# UI Contracts: Category Settings

Component props and pure-function signatures for this feature. Folder convention (spec 001): the
main component sits at the root of its folder, each sub-component in its own folder, no
`index.ts` files.

## Route

| URL | File | Change |
| --- | --- | --- |
| `/settings` | `app/(admin)/settings/page.tsx` | Heading "Indstillinger", subtitle "Opsæt feedback-widget, kategorier, notifikationer og datahåndtering", then `<CategorySettings />`. Stays a Server Component; `metadata.title` stays "Indstillinger". |

## Components

### `CategorySettings` (`components/category-settings/CategorySettings.tsx`, client)

```ts
export function CategorySettings(): JSX.Element
```

- Reads `useCategoriesStore((state) => state.categories)`; calls `addCategory` and
  `toggleCategory` from `lib/categories/store.ts`.
- Renders a `section` labelled "Kategorier" with the subtitle "Det AI'en kan sortere feedback i",
  the "Tilføj ny kategori" button, and a list with one `CategoryRow` per category, in a loop.
- Owns `isAdding` (dialog open). Renders `AddCategoryModal` only while open. On close, focus
  returns to the "Tilføj ny kategori" button. Closes the dialog when the page is hidden
  (research R12).

### `CategoryRow` (`components/category-settings/CategoryRow/CategoryRow.tsx`)

```ts
type CategoryRowProps = {
  category: Category;
  onToggle: (id: string) => void;
};
```

- A list item with the category's icon in a `.category-badge--<color>` circle, its name as text,
  and a `<button role="switch" aria-checked={category.isEnabled}>` whose accessible name is the
  category name. Pressing it calls `onToggle(category._id)`.

### `AddCategoryModal` (`components/category-settings/AddCategoryModal/AddCategoryModal.tsx`, client)

```ts
type AddCategoryModalProps = {
  categories: Category[];                                   // for the duplicate check
  onAdd: (input: { name: string; icon: CategoryIcon; color: CategoryColor }) => void;
  onClose: () => void;                                      // Annuller, ×, Escape, backdrop
};
```

- A native `<dialog>` opened with `showModal()` on mount, `aria-labelledby` its title.
- Keeps its own draft: `name`, `icon` (`null` at first), `color` (`null` at first),
  `showDuplicate`.
- Texts: title "Tilføj ny kategori"; description "Giv AI'en en ny måde at sortere feedback på.";
  field label "Kategorinavn", placeholder "f.eks. Forbedring", helper "AI'en kan vælge
  kategorien, når den sorterer feedback."; icon legend "Kategori-ikon" with the hint "Vælg én";
  colour legend "Kategorifarve"; buttons "Annuller", "Tilføj kategori"; close button named "Luk";
  duplicate message "Der findes allerede en kategori med det navn.".
- "Tilføj kategori" is disabled while `validateCategoryName` returns `"empty"` or `icon`/`color`
  is `null`. On submit: if the name is a duplicate, show the message and stay open; otherwise
  call `onAdd` with the trimmed name, then `onClose`. Changing the name hides the message.
- Icons: seven radio inputs named after `CATEGORY_ICONS` (Idé, Fejl, Besked, Indbakke,
  Vedhæftning, Forgrening, Fremskridt). Colours: eight radio inputs named Rød, Orange, Gul, Grøn,
  Turkis, Blå, Lilla, Pink.

## Changed inbox components

| Component | Change |
| --- | --- |
| `Inbox` | Also reads `useCategoriesStore`; passes `categories` to `Toolbar`, `TicketList` and the open ticket's category to `TicketDetail` |
| `Toolbar` | New prop `categories: Category[]`; the category select lists "Alle" plus every category's name |
| `TicketList` | New prop `categories: Category[]`; passes each ticket's category to `TicketRow` |
| `TicketRow` | New prop `category: Category \| undefined`; draws its icon in `.category-badge--<color>`, labelled by its name |
| `TicketDetail` | New prop `category: Category \| undefined`; the chip shows its name |

An unknown category id (not possible today, since categories cannot be deleted) shows no icon
and no name rather than crashing.

## Store and pure functions

```ts
// lib/categories/store.ts
export const useCategoriesStore: UseBoundStore<StoreApi<{ categories: Category[] }>>;
export function addCategory(input: { name: string; icon: CategoryIcon; color: CategoryColor }): void;
export function toggleCategory(id: string): void;
export function resetCategories(): void;

// lib/categories/state.ts
export function categoriesReducer(categories: Category[], action: CategoryAction): Category[];
export function validateCategoryName(name: string, categories: Category[]): "empty" | "duplicate" | null;
export function getCategory(categories: Category[], id: string): Category | undefined;

// components/Icons/category-icons.ts
export const CATEGORY_ICONS: Record<CategoryIcon, { Icon: ComponentType<SvgIconProps>; label: string }>;
export const CATEGORY_COLOR_LABELS: Record<CategoryColor, string>;
```

`addCategory` reads `crypto.randomUUID()` and `Date.now()`; it is only called from event
handlers, never while rendering.
