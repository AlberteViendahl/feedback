import type { Feedback } from "@/lib/types";
import type { CategoryFilter, InboxView } from "./state";

function inCategory(tickets: Feedback[], category: CategoryFilter): Feedback[] {
  return category === "all" ? tickets : tickets.filter((ticket) => ticket.category === category);
}

export function getVisibleTickets(tickets: Feedback[], view: InboxView): Feedback[] {
  const byCategory = inCategory(tickets, view.categoryFilter);
  const byStatus =
    view.statusFilter === "done"
      ? byCategory.filter((ticket) => ticket.status === "done")
      : byCategory;
  const direction = view.sortOrder === "newest" ? -1 : 1;
  return [...byStatus].sort((a, b) => direction * (a._creationTime - b._creationTime));
}

/** Counts for the All/Done switch; both follow the current category filter. */
export function getCounts(
  tickets: Feedback[],
  category: CategoryFilter,
): { all: number; done: number } {
  const inScope = inCategory(tickets, category);
  return {
    all: inScope.length,
    done: inScope.filter((ticket) => ticket.status === "done").length,
  };
}

/** The open ticket, or null when nothing is selected or a filter hides it. */
export function getSelectedTicket(tickets: Feedback[], view: InboxView): Feedback | null {
  return getVisibleTickets(tickets, view).find((ticket) => ticket._id === view.selectedId) ?? null;
}
