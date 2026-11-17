import { CATEGORY_LABELS } from "@/lib/inbox/format";
import type { FeedbackCategory } from "@/lib/types";
import { Icon } from "./Icon";

type CategoryIconProps = {
  category: FeedbackCategory;
};

export function CategoryIcon({ category }: CategoryIconProps) {
  return <Icon name={`category-${category}`} alt={CATEGORY_LABELS[category]} className="shrink-0" />;
}
