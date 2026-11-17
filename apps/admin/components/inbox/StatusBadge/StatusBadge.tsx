import type { Feedback } from "@/lib/types";

type StatusBadgeProps = {
  ticket: Pick<Feedback, "isRead" | "status">;
};

/** Badge rule from data-model.md: unread wins, then In progress, then Done. */
export function StatusBadge({ ticket }: StatusBadgeProps) {
  if (!ticket.isRead) return <span className="badge badge--new">Ny</span>;
  if (ticket.status === "in_progress") return <span className="badge badge--progress">I gang</span>;
  if (ticket.status === "done") return <span className="badge badge--done">Færdig</span>;
  return null;
}
