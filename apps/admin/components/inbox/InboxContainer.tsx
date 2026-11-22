"use client";

import { createIssue, markRead, sendReply, useTicketsStore } from "@/lib/tickets/store";
import { Inbox } from "./Inbox";

/** Connects the inbox to the shared ticket store. With Convex, swap the store for queries. */
export function InboxContainer() {
  const tickets = useTicketsStore((state) => state.tickets);
  return (
    <Inbox
      tickets={tickets}
      onOpenTicket={markRead}
      onSendReply={sendReply}
      onCreateIssue={createIssue}
    />
  );
}
