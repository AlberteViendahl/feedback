import { CATEGORY_LABELS, formatRelativeTime, formatShortDate, getPagePath } from "@/lib/inbox/format";
import { PLATFORM_LABELS } from "@/lib/platforms";
import type { Feedback } from "@/lib/types";
import { BugIcon } from "@/components/Icons/BugIcon";
import { LightbulbIcon } from "@/components/Icons/LightbulbIcon";
import { MessageIcon } from "@/components/Icons/MessageIcon";
import { PaperclipIcon } from "@/components/Icons/PaperclipIcon";
import { StatusBadge } from "../StatusBadge/StatusBadge";

type TicketRowProps = {
  ticket: Feedback;
  isSelected: boolean;
  /** null before hydration: show the absolute date instead of "x min siden". */
  now: number | null;
  onSelect: (id: string) => void;
};

export function TicketRow({ ticket, isSelected, now, onSelect }: TicketRowProps) {
  const { sender, context, attachments } = ticket;
  const time =
    now === null ? formatShortDate(ticket._creationTime) : formatRelativeTime(ticket._creationTime, now);

  return (
    <button
      type="button"
      className={isSelected ? "list-row list-row--selected" : "list-row"}
      aria-current={isSelected ? "true" : undefined}
      onClick={() => onSelect(ticket._id)}
    >
      <span className={`category-badge category-badge--${ticket.category}`}>
        {ticket.category === "bug" && <BugIcon label={CATEGORY_LABELS.bug} />}
        {ticket.category === "idea" && <LightbulbIcon label={CATEGORY_LABELS.idea} />}
        {ticket.category === "general" && <MessageIcon label={CATEGORY_LABELS.general} />}
      </span>
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
