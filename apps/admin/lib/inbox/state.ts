import type { FeedbackCategory } from "@/lib/types";

// The inbox's view state only. Ticket data lives in lib/tickets/state.ts and is shared by
// every admin page (spec 002); this state resets whenever the inbox remounts.

export type StatusFilter = "all" | "done";
export type CategoryFilter = "all" | FeedbackCategory;
export type SortOrder = "newest" | "oldest";
export type InboxNotice = "reply-sent" | "issue-created" | null;

export type InboxView = {
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  sortOrder: SortOrder;
  selectedId: string | null;
  replyDraft: string;
  notice: InboxNotice;
  /** The search text exactly as typed (spec 003); see lib/inbox/search.ts. */
  search: string;
};

export type InboxViewAction =
  | { type: "select"; id: string }
  | { type: "setStatusFilter"; value: StatusFilter }
  | { type: "setCategoryFilter"; value: CategoryFilter }
  | { type: "setSortOrder"; value: SortOrder }
  | { type: "editReply"; text: string }
  | { type: "setSearch"; value: string }
  | { type: "reset" }
  | { type: "showNotice"; notice: Exclude<InboxNotice, null> };

export const STANDARD_REPLY =
  "Din oplevelse er vigtig for os. Vi samler alle beskederne sammen, så vi kan gøre hjemmesiden endnu bedre.";

export function createInitialView(): InboxView {
  return {
    statusFilter: "all",
    categoryFilter: "all",
    sortOrder: "newest",
    selectedId: null,
    replyDraft: STANDARD_REPLY,
    notice: null,
    search: "",
  };
}

export function inboxViewReducer(view: InboxView, action: InboxViewAction): InboxView {
  switch (action.type) {
    case "select":
      return { ...view, selectedId: action.id, replyDraft: STANDARD_REPLY, notice: null };
    case "setStatusFilter":
      return { ...view, statusFilter: action.value };
    case "setCategoryFilter":
      return { ...view, categoryFilter: action.value };
    case "setSortOrder":
      return { ...view, sortOrder: action.value };
    case "editReply":
      return { ...view, replyDraft: action.text };
    case "setSearch":
      return { ...view, search: action.value };
    case "showNotice":
      return { ...view, notice: action.notice };
    case "reset":
      return createInitialView();
  }
}
