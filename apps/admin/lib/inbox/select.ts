import type { Feedback } from "@/lib/types";
import { getSearchWords, matchesSearch } from "./search";
import type { InboxView } from "./state";

/** Tickets in the chosen category that match the search; the scope of the list and its counts. */
function inScope(tickets: Feedback[], view: Pick<InboxView, "categoryFilter" | "search">): Feedback[] {
  const words = getSearchWords(view.search);
  return tickets.filter(
    (ticket) =>
      (view.categoryFilter === "all" || ticket.category === view.categoryFilter) &&
      matchesSearch(ticket, words),
  );
}

export function getVisibleTickets(tickets: Feedback[], view: InboxView): Feedback[] {
  const scoped = inScope(tickets, view);
  const byStatus =
    view.statusFilter === "done" ? scoped.filter((ticket) => ticket.status === "done") : scoped;
  const direction = view.sortOrder === "newest" ? -1 : 1;
  return [...byStatus].sort((a, b) => direction * (a._creationTime - b._creationTime));
}

/** Counts for the All/Done switch; both follow the current category filter and search. */
export function getCounts(
  tickets: Feedback[],
  view: Pick<InboxView, "categoryFilter" | "search">,
): { all: number; done: number } {
  const scoped = inScope(tickets, view);
  return {
    all: scoped.length,
    done: scoped.filter((ticket) => ticket.status === "done").length,
  };
}

/** The open ticket, or null when nothing is selected or a filter or the search hides it. */
export function getSelectedTicket(tickets: Feedback[], view: InboxView): Feedback | null {
  return getVisibleTickets(tickets, view).find((ticket) => ticket._id === view.selectedId) ?? null;
}
