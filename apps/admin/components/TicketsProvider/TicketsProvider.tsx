"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { ticketsReducer, type TicketAction } from "@/lib/tickets/state";
import type { Feedback } from "@/lib/types";

type TicketsContextValue = {
  tickets: Feedback[];
  dispatch: (action: TicketAction) => void;
};

const TicketsContext = createContext<TicketsContextValue | null>(null);

type TicketsProviderProps = {
  initialTickets: Feedback[];
  children: ReactNode;
};

/**
 * Ticket data for the whole admin session. Lives in the (admin) layout, so it survives
 * navigation between pages (spec 002, research R1). Replace with Convex queries later.
 */
export function TicketsProvider({ initialTickets, children }: TicketsProviderProps) {
  const [tickets, dispatch] = useReducer(ticketsReducer, initialTickets);
  return <TicketsContext value={{ tickets, dispatch }}>{children}</TicketsContext>;
}

export function useTickets(): TicketsContextValue {
  const value = useContext(TicketsContext);
  if (!value) throw new Error("useTickets must be used inside TicketsProvider");
  return value;
}
