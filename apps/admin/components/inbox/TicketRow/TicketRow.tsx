import { formatRelativeTime, formatShortDate, getPagePath } from "@/lib/inbox/format";
import { PLATFORM_LABELS } from "@/lib/platforms";
import type { Category, Feedback } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/Icons/category-icons";
import { PaperclipIcon } from "@/components/Icons/PaperclipIcon";
import { StatusBadge } from "../StatusBadge/StatusBadge";

type TicketRowProps = {
  ticket: Feedback;
  /** The ticket's category; undefined shows no category icon. */
  category: Category | undefined;
  isSelected: boolean;
  /** null before hydration: show the absolute date instead of "x min siden". */
  now: number | null;
  onSelect: (id: string) => void;
};

export function TicketRow({ ticket, category, isSelected, now, onSelect }: TicketRowProps) {
  const { sender, context, attachments } = ticket;
  const CategoryIcon = category && CATEGORY_ICONS[category.icon].Icon;
  const time =
    now === null ? formatShortDate(ticket._creationTime) : formatRelativeTime(ticket._creationTime, now);

  return (
    <button
      type="button"
      className={isSelected ? "list-row list-row--selected" : "list-row"}
      aria-current={isSelected ? "true" : undefined}
      onClick={() => onSelect(ticket._id)}
    >
      {category && CategoryIcon && (
        <span className={`category-badge category-badge--${category.color}`}>
          <CategoryIcon label={category.name} />
        </span>
      )}
      <span className="ticket-row__body">
        <span className="text-title truncate-line">{ticket.description}</span>
        <span className="text-meta ticket-row__aside">{time}</span>
        <span className="text-meta ticket-row__meta">
          <span className="truncate-line">
            {sender.email} · {PLATFORM_LABELS[context.platform]} · {getPagePath(context.pageUrl)}
          </span>
          {attachments.length > 0 && (
            <span className="ticket-row__meta shrink-0">
              <PaperclipIcon label="Vedhæftede filer" />
              {attachments.length}
            </span>
          )}
        </span>
        <span className="ticket-row__aside">
          <StatusBadge ticket={ticket} />
        </span>
      </span>
    </button>
  );
}
