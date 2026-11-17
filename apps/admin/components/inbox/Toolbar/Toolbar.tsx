import type { CategoryFilter, SortOrder, StatusFilter } from "@/lib/inbox/state";
import { CATEGORY_LABELS } from "@/lib/inbox/format";
import { Icon } from "@/components/Icons/Icon";

type ToolbarProps = {
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  sortOrder: SortOrder;
  counts: { all: number; done: number };
  onStatusFilterChange: (value: StatusFilter) => void;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  onSortOrderChange: (value: SortOrder) => void;
};

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "bug", label: CATEGORY_LABELS.bug },
  { value: "idea", label: CATEGORY_LABELS.idea },
  { value: "general", label: CATEGORY_LABELS.general },
];

function isCategoryFilter(value: string): value is CategoryFilter {
  return CATEGORY_OPTIONS.some((option) => option.value === value);
}

export function Toolbar({
  statusFilter,
  categoryFilter,
  sortOrder,
  counts,
  onStatusFilterChange,
  onCategoryFilterChange,
  onSortOrderChange,
}: ToolbarProps) {
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Alle ${counts.all}` },
    { value: "done", label: `Færdig ${counts.done}` },
  ];

  return (
    <div className="inbox__toolbar">
      <div className="segmented" role="group" aria-label="Status">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              option.value === statusFilter
                ? "segmented__item segmented__item--active"
                : "segmented__item"
            }
            aria-pressed={option.value === statusFilter}
            onClick={() => onStatusFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="pill-button">
        Kategori:
        <select
          className="inbox__select"
          value={categoryFilter}
          onChange={(event) => {
            if (isCategoryFilter(event.target.value)) onCategoryFilterChange(event.target.value);
          }}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" />
      </label>

      <button
        type="button"
        className="pill-button font-medium"
        onClick={() => onSortOrderChange(sortOrder === "newest" ? "oldest" : "newest")}
      >
        <Icon name="sort" />
        {sortOrder === "newest" ? "Nyeste først" : "Ældste først"}
      </button>
    </div>
  );
}
