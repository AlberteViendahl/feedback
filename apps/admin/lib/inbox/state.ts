import type { Feedback, FeedbackCategory } from "@/lib/types";

export type StatusFilter = "all" | "done";
export type CategoryFilter = "all" | FeedbackCategory;
export type SortOrder = "newest" | "oldest";
export type InboxNotice = "reply-sent" | "issue-created" | null;

export type InboxState = {
  tickets: Feedback[];
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  sortOrder: SortOrder;
  selectedId: string | null;
  replyDraft: string;
  notice: InboxNotice;
};

export type InboxAction =
  | { type: "select"; id: string }
  | { type: "setStatusFilter"; value: StatusFilter }
  | { type: "setCategoryFilter"; value: CategoryFilter }
  | { type: "setSortOrder"; value: SortOrder }
  | { type: "editReply"; text: string }
  | { type: "sendReply"; now: number }
  | { type: "createIssue" };

export const STANDARD_REPLY =
  "Din oplevelse er vigtig for os. Vi samler alle beskederne sammen, så vi kan gøre hjemmesiden endnu bedre.";

export function createInitialState(tickets: Feedback[]): InboxState {
  return {
    tickets,
    statusFilter: "all",
    categoryFilter: "all",
    sortOrder: "newest",
    selectedId: null,
    replyDraft: STANDARD_REPLY,
    notice: null,
  };
}

function updateTicket(
  tickets: Feedback[],
  id: string,
  update: (ticket: Feedback) => Feedback,
): Feedback[] {
  return tickets.map((ticket) => (ticket._id === id ? update(ticket) : ticket));
}

export function inboxReducer(state: InboxState, action: InboxAction): InboxState {
  const selected = state.tickets.find((ticket) => ticket._id === state.selectedId);

  switch (action.type) {
    case "select": {
      if (!state.tickets.some((ticket) => ticket._id === action.id)) return state;
      return {
        ...state,
        tickets: updateTicket(state.tickets, action.id, (ticket) => ({ ...ticket, isRead: true })),
        selectedId: action.id,
        replyDraft: STANDARD_REPLY,
        notice: null,
      };
    }
    case "setStatusFilter":
      return { ...state, statusFilter: action.value };
    case "setCategoryFilter":
      return { ...state, categoryFilter: action.value };
    case "setSortOrder":
      return { ...state, sortOrder: action.value };
    case "editReply":
      return { ...state, replyDraft: action.text };
    case "sendReply": {
      const text = state.replyDraft.trim();
      if (!selected || selected.reply || text === "") return state;
      return {
        ...state,
        tickets: updateTicket(state.tickets, selected._id, (ticket) => ({
          ...ticket,
          reply: { text, sentAt: action.now },
          status: "done",
        })),
        notice: "reply-sent",
      };
    }
    case "createIssue": {
      if (!selected || selected.githubIssueCreated) return state;
      return {
        ...state,
        tickets: updateTicket(state.tickets, selected._id, (ticket) => ({
          ...ticket,
          githubIssueCreated: true,
          status: ticket.status === "done" ? "done" : "in_progress",
        })),
        notice: "issue-created",
      };
    }
  }
}
