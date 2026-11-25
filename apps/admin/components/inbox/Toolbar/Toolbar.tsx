import type { CategoryFilter, SortOrder, StatusFilter } from "@/lib/inbox/state";
import type { Category } from "@/lib/types";
import { Icon } from "@/components/Icons/Icon";

type ToolbarProps = {
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  sortOrder: SortOrder;
  counts: { all: number; done: number };
  /** Every category, on or off, in list order (spec 006, FR-017, FR-018). */
  categories: Category[];
  onStatusFilterChange: (value: StatusFilter) => void;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  onSortOrderChange: (value: SortOrder) => void;
};

export function Toolbar({
  statusFilter,
  categoryFilter,
  sortOrder,
  counts,
  categories,
  onStatusFilterChange,
  onCategoryFilterChange,
  onSortOrderChange,
}: ToolbarProps) {
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Alle ${counts.all}` },
    { value: "done", label: `Færdig ${counts.done}` },
  ];
  const categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "Alle" },
    ...categories.map((category) => ({ value: category._id, label: category.name })),
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
            const value = event.target.value;
            if (categoryOptions.some((option) => option.value === value)) onCategoryFilterChange(value);
          }}
        >
          {categoryOptions.map((option) => (
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
