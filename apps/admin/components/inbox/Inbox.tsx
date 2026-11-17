"use client";

import { useReducer } from "react";
import { getCounts, getSelectedTicket, getVisibleTickets } from "@/lib/inbox/select";
import { createInitialState, inboxReducer } from "@/lib/inbox/state";
import { useNow } from "@/lib/inbox/use-now";
import type { Feedback } from "@/lib/types";
import { Toolbar } from "./Toolbar/Toolbar";
import { TicketDetail } from "./TicketDetail/TicketDetail";
import { TicketList } from "./TicketList/TicketList";

type InboxProps = {
  initialTickets: Feedback[];
};

/** The only stateful inbox component; everything below it renders props (Constitution V). */
export function Inbox({ initialTickets }: InboxProps) {
  const [state, dispatch] = useReducer(inboxReducer, initialTickets, createInitialState);
  const now = useNow();

  return (
    <section className="inbox" aria-label="Feedback-indbakke">
      <Toolbar
        statusFilter={state.statusFilter}
        categoryFilter={state.categoryFilter}
        sortOrder={state.sortOrder}
        counts={getCounts(state.tickets, state.categoryFilter)}
        onStatusFilterChange={(value) => dispatch({ type: "setStatusFilter", value })}
        onCategoryFilterChange={(value) => dispatch({ type: "setCategoryFilter", value })}
        onSortOrderChange={(value) => dispatch({ type: "setSortOrder", value })}
      />
      <div className="inbox__columns">
        <div className="card inbox__panel">
          <TicketList
            tickets={getVisibleTickets(state)}
            selectedId={state.selectedId}
            now={now}
            onSelect={(id) => dispatch({ type: "select", id })}
          />
        </div>
        <div className="card inbox__panel">
          <TicketDetail
            ticket={getSelectedTicket(state)}
            replyDraft={state.replyDraft}
            notice={state.notice}
            onReplyDraftChange={(text) => dispatch({ type: "editReply", text })}
            // The clock is read in the event handler, never while rendering (research R2).
            onSendReply={() => dispatch({ type: "sendReply", now: Date.now() })}
            onCreateIssue={() => dispatch({ type: "createIssue" })}
          />
        </div>
      </div>
    </section>
  );
}
