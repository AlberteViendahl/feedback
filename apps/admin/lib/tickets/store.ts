import { create } from "zustand";
import { mockFeedback } from "@/lib/mock-feedback";
import type { Feedback } from "@/lib/types";
import { ticketsReducer, type TicketAction } from "./state";

type TicketsState = { tickets: Feedback[] };

/**
 * The session's tickets, shared by the inbox and the side menu (spec 004). Client-only: Server
 * Components never import it, and nothing writes to it while rendering (research R2). Select
 * `state.tickets` only; a selector that builds a new object re-renders forever.
 * Replace with Convex queries later.
 */
export const useTicketsStore = create<TicketsState>()(() => ({ tickets: mockFeedback }));

function apply(action: TicketAction) {
  useTicketsStore.setState((state) => ({ tickets: ticketsReducer(state.tickets, action) }));
}

export function markRead(id: string) {
  apply({ type: "markRead", id });
}

export function sendReply(id: string, text: string, now: number) {
  apply({ type: "sendReply", id, text, now });
}

export function createIssue(id: string) {
  apply({ type: "createIssue", id });
}

/** Back to the tickets as at first load: on log-out (FR-008) and after every test. */
export function resetTickets() {
  useTicketsStore.setState(useTicketsStore.getInitialState(), true);
}
