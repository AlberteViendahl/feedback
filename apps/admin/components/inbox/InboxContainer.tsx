"use client";

import { useTickets } from "@/components/TicketsProvider/TicketsProvider";
import { Inbox } from "./Inbox";

/** Connects the inbox to the shared ticket data. With Convex, swap useTickets() for queries. */
export function InboxContainer() {
  const { tickets, dispatch } = useTickets();
  return (
    <Inbox
      tickets={tickets}
      onOpenTicket={(id) => dispatch({ type: "markRead", id })}
      onSendReply={(id, text, now) => dispatch({ type: "sendReply", id, text, now })}
      onCreateIssue={(id) => dispatch({ type: "createIssue", id })}
    />
  );
}
