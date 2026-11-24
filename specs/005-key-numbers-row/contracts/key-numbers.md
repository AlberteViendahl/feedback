# Contract: Key Numbers

## `getKeyNumbers(tickets, now)`

`apps/admin/lib/tickets/key-numbers.ts`

```ts
type KeyNumbers = {
  newCount: number;
  inProgressCount: number;
  doneLast30Days: number | null;
  bugsThisWeek: number | null;
  bugsChange: number | null;
};

function getKeyNumbers(tickets: Feedback[], now: number | null): KeyNumbers;
```

- Pure: no clock reads, no store access. Same input, same output.
- Rules: see [data-model.md](../data-model.md#keynumbers-derived-never-stored).
- `now === null` → the three time-based fields are `null`; the other two are still counted.

## `<KeyNumbers numbers={…} />`

`apps/admin/components/inbox/KeyNumbers/KeyNumbers.tsx`. Presentational; data via props only
(Constitution V).

| Prop | Type |
| ---- | ---- |
| `numbers` | `KeyNumbers` |

Rendered output, in order:

| # | Class | Icon | Number | Label |
| - | ----- | ---- | ------ | ----- |
| 1 | `stat-card stat-card--info` | `InboxIcon` | `newCount` | Nye · ikke åbnet endnu |
| 2 | `stat-card stat-card--warning` | `ProgressIcon` | `inProgressCount` | I gang |
| 3 | `stat-card stat-card--success` | `CheckIcon` | `doneLast30Days` | Færdige · sidste 30 dage |
| 4 | `stat-card stat-card--danger` | `BugIcon` | `bugsThisWeek` | Fejl denne uge[ · ↑ n / ↓ n] |

- Container: `<ul class="key-numbers" aria-label="Nøgletal">`, one `<li>` per card.
- `null` number → "–"; `bugsChange` `null` or `0` → no change shown.
- Numbers formatted with `Intl.NumberFormat("da-DK")`.
- Number precedes label in the DOM. Arrow is `aria-hidden`; a visually hidden text reads
  "n flere end sidste uge" / "n færre end sidste uge".
- Icons are decorative (`aria-hidden`).
- No interactive elements, no `tabindex`, no hover styles.

## Placement

`Inbox` renders `<KeyNumbers numbers={getKeyNumbers(tickets, now)} />` as the first child of
`<section className="inbox">`, above `Toolbar`.
