import type { Feedback } from "@/lib/types";

/** Changes to ticket data, shared by every admin page (spec 002, data-model.md). */
export type TicketAction =
  | { type: "markRead"; id: string }
  | { type: "sendReply"; id: string; text: string; now: number }
  | { type: "createIssue"; id: string };

/** Disallowed actions return the same array, so React skips re-rendering. */
export function ticketsReducer(tickets: Feedback[], action: TicketAction): Feedback[] {
  const ticket = tickets.find((candidate) => candidate._id === action.id);
  if (!ticket) return tickets;

  let updated: Feedback;
  switch (action.type) {
    case "markRead": {
      updated = { ...ticket, isRead: true };
      break;
    }
    case "sendReply": {
      const text = action.text.trim();
      if (ticket.reply || text === "") return tickets;
      updated = { ...ticket, reply: { text, sentAt: action.now }, status: "done", completedAt: action.now };
      break;
    }
    case "createIssue": {
      if (ticket.githubIssueCreated) return tickets;
      updated = {
        ...ticket,
        githubIssueCreated: true,
        status: ticket.status === "done" ? "done" : "in_progress",
      };
      break;
    }
  }

  return tickets.map((candidate) => (candidate._id === action.id ? updated : candidate));
}
