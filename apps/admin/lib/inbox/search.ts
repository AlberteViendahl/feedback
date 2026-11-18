import { PLATFORM_LABELS } from "@/lib/platforms";
import type { Feedback } from "@/lib/types";
import { formatTicketNumber, getPagePath } from "./format";

// Search for the inbox (spec 003, research R2). The admin's text is only ever compared with
// `includes`, never turned into a pattern, so every character matches itself.

/** The search as lower-case words; empty when the text is empty or only spaces. */
export function getSearchWords(search: string): string[] {
  return search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== "");
}

/** The details a search looks in, as shown in the inbox. One per line, so no word spans two. */
function getSearchText(ticket: Feedback): string {
  const { sender, context } = ticket;
  return [
    ticket.description,
    formatTicketNumber(ticket.number),
    sender.name,
    sender.email,
    sender.company,
    PLATFORM_LABELS[context.platform],
    getPagePath(context.pageUrl),
  ]
    .filter((detail) => detail !== undefined)
    .join("\n")
    .toLowerCase();
}

/** True when every word occurs somewhere in the ticket's searched details. */
export function matchesSearch(ticket: Feedback, words: string[]): boolean {
  if (words.length === 0) return true;
  const text = getSearchText(ticket);
  return words.every((word) => text.includes(word));
}
