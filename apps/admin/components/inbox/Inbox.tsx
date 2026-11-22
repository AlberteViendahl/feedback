"use client";

import { useLayoutEffect, useReducer } from "react";
import { getSearchWords } from "@/lib/inbox/search";
import { getCounts, getSelectedTicket, getVisibleTickets } from "@/lib/inbox/select";
import { createInitialView, inboxViewReducer } from "@/lib/inbox/state";
import { useNow } from "@/lib/inbox/use-now";
import type { Feedback } from "@/lib/types";
import { SearchBar } from "./SearchBar/SearchBar";
import { Toolbar } from "./Toolbar/Toolbar";
import { TicketDetail } from "./TicketDetail/TicketDetail";
import { TicketList } from "./TicketList/TicketList";

type InboxProps = {
  tickets: Feedback[];
  onOpenTicket: (id: string) => void;
  onSendReply: (id: string, text: string, now: number) => void;
  onCreateIssue: (id: string) => void;
};

/**
 * Renders the given tickets and reports ticket changes through callbacks. Only the view
 * (search, filters, open ticket, draft, notice) is kept here, and it resets whenever the inbox
 * is hidden or remounts.
 */
export function Inbox({ tickets, onOpenTicket, onSendReply, onCreateIssue }: InboxProps) {
  const [view, dispatch] = useReducer(inboxViewReducer, undefined, createInitialView);
  const now = useNow();

  // With Cache Components, Next.js hides this page with <Activity> when the admin navigates
  // away, instead of unmounting it. Reset the view as it is hidden, so it starts fresh on return
  // (spec 002 FR-017, spec 003 FR-015, research R9). Ticket changes live in the ticket store.
  useLayoutEffect(() => () => dispatch({ type: "reset" }), []);
  const selected = getSelectedTicket(tickets, view);

  function handleSelect(id: string) {
    dispatch({ type: "select", id });
    onOpenTicket(id);
  }

  function handleSendReply() {
    const text = view.replyDraft.trim();
    if (!selected || selected.reply || text === "") return;
    // The clock is read in the event handler, never while rendering (spec 001 research R2).
    onSendReply(selected._id, text, Date.now());
    dispatch({ type: "showNotice", notice: "reply-sent" });
  }

  function handleCreateIssue() {
    if (!selected || selected.githubIssueCreated) return;
    onCreateIssue(selected._id);
    dispatch({ type: "showNotice", notice: "issue-created" });
  }

  return (
    <>
      {/* Outside the section, so the bar can run edge to edge above it (spec 003, research R6). */}
      <SearchBar value={view.search} onChange={(value) => dispatch({ type: "setSearch", value })} />
      <section className="inbox" aria-label="Feedback-indbakke">
        <Toolbar
          statusFilter={view.statusFilter}
          categoryFilter={view.categoryFilter}
          sortOrder={view.sortOrder}
          counts={getCounts(tickets, view)}
          onStatusFilterChange={(value) => dispatch({ type: "setStatusFilter", value })}
          onCategoryFilterChange={(value) => dispatch({ type: "setCategoryFilter", value })}
          onSortOrderChange={(value) => dispatch({ type: "setSortOrder", value })}
        />
        <div className="inbox__columns">
          <div className="card inbox__panel">
            <TicketList
              tickets={getVisibleTickets(tickets, view)}
              selectedId={view.selectedId}
              now={now}
              isSearching={getSearchWords(view.search).length > 0}
              onSelect={handleSelect}
            />
          </div>
          <div className="card inbox__panel">
            <TicketDetail
              ticket={selected}
              replyDraft={view.replyDraft}
              notice={view.notice}
              onReplyDraftChange={(text) => dispatch({ type: "editReply", text })}
              onSendReply={handleSendReply}
              onCreateIssue={handleCreateIssue}
            />
          </div>
        </div>
      </section>
    </>
  );
}
