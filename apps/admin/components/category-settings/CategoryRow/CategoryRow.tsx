import { CATEGORY_ICONS } from "@/components/Icons/category-icons";
import type { Category } from "@/lib/types";

type CategoryRowProps = {
  category: Category;
  onToggle: (id: string) => void;
};

/** One category in the settings list: icon, name and its on/off switch (spec 006). */
export function CategoryRow({ category, onToggle }: CategoryRowProps) {
  const { Icon } = CATEGORY_ICONS[category.icon];

  return (
    <li className="category-row">
      <span className="category-row__label">
        <span className={`category-badge category-badge--${category.color}`}>
          <Icon />
        </span>
        {category.name}
      </span>
      {/* On: the (future) AI may choose this category (FR-016). */}
      <button
        type="button"
        role="switch"
        className="switch"
        aria-checked={category.isEnabled}
        aria-label={category.name}
        onClick={() => onToggle(category._id)}
      />
    </li>
  );
}
