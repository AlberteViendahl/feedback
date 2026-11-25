"use client";

import { useLayoutEffect, useReducer } from "react";
import { getCategory } from "@/lib/categories/state";
import { useCategoriesStore } from "@/lib/categories/store";
import { getSearchWords } from "@/lib/inbox/search";
import { getCounts, getSelectedTicket, getVisibleTickets } from "@/lib/inbox/select";
import { createInitialView, inboxViewReducer } from "@/lib/inbox/state";
import { useNow } from "@/lib/inbox/use-now";
import { getKeyNumbers } from "@/lib/tickets/key-numbers";
import { createIssue, markRead, sendReply, useTicketsStore } from "@/lib/tickets/store";
import { KeyNumbers } from "./KeyNumbers/KeyNumbers";
import { SearchBar } from "./SearchBar/SearchBar";
import { Toolbar } from "./Toolbar/Toolbar";
import { TicketDetail } from "./TicketDetail/TicketDetail";
import { TicketList } from "./TicketList/TicketList";

/**
 * The inbox, reading and changing tickets through the shared ticket store (with Convex, swap the
 * store for queries). Only the view (search, filters, open ticket, draft, notice) is kept here,
 * and it resets whenever the inbox is hidden or remounts.
 */
export function Inbox() {
  const tickets = useTicketsStore((state) => state.tickets);
  const categories = useCategoriesStore((state) => state.categories);
  const [view, dispatch] = useReducer(inboxViewReducer, undefined, createInitialView);
  const now = useNow();

  // With Cache Components, Next.js hides this page with <Activity> when the admin navigates
  // away, instead of unmounting it. Reset the view as it is hidden, so it starts fresh on return
  // (spec 002 FR-017, spec 003 FR-015, research R9). Ticket changes live in the ticket store.
  useLayoutEffect(() => () => dispatch({ type: "reset" }), []);
  const selected = getSelectedTicket(tickets, view);
  const selectedCategory = selected ? getCategory(categories, selected.category) : undefined;

  function handleSelect(id: string) {
    dispatch({ type: "select", id });
    markRead(id);
  }

  function handleSendReply() {
    const text = view.replyDraft.trim();
    if (!selected || selected.reply || text === "") return;
    // The clock is read in the event handler, never while rendering (spec 001 research R2).
    sendReply(selected._id, text, Date.now());
    dispatch({ type: "showNotice", notice: "reply-sent" });
  }

  function handleCreateIssue() {
    if (!selected || selected.githubIssueCreated) return;
    createIssue(selected._id);
    dispatch({ type: "showNotice", notice: "issue-created" });
  }

  return (
    <>
      {/* Outside the section, so the bar can run edge to edge above it (spec 003, research R6). */}
      <SearchBar value={view.search} onChange={(value) => dispatch({ type: "setSearch", value })} />
      <section className="inbox" aria-label="Feedback-indbakke">
        {/* Counts every ticket, so search and filters never change it (spec 005 FR-007). */}
        <KeyNumbers numbers={getKeyNumbers(tickets, now)} />
        <Toolbar
          categories={categories}
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
              categories={categories}
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
              category={selectedCategory}
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
