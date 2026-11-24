import type { Feedback } from "@/lib/types";

/** The numbers in the row above the inbox (spec 005). `null` until the current time is known. */
export type KeyNumbers = {
  newCount: number;
  inProgressCount: number;
  doneLast30Days: number | null;
  bugsThisWeek: number | null;
  /** This week's bugs minus last week's. */
  bugsChange: number | null;
};

const DONE_WINDOW = 30 * 24 * 60 * 60 * 1000;

/** Counts every ticket in the workspace; inbox search and filters are not inputs (FR-007). */
export function getKeyNumbers(tickets: Feedback[], now: number | null): KeyNumbers {
  let newCount = 0;
  let inProgressCount = 0;
  for (const ticket of tickets) {
    // Same rule as getNewCounts, so the row and the side menu always agree (FR-002).
    if (!ticket.isRead) newCount += 1;
    else if (ticket.status !== "done") inProgressCount += 1;
  }

  if (now === null) {
    return { newCount, inProgressCount, doneLast30Days: null, bugsThisWeek: null, bugsChange: null };
  }

  // A fixed 30 × 24 h, counted back from now; exactly 30 days ago still counts (research R4).
  const doneLast30Days = tickets.filter(
    (ticket) =>
      ticket.status === "done" &&
      ticket.completedAt !== undefined &&
      now - ticket.completedAt <= DONE_WINDOW,
  ).length;

  const thisMonday = startOfWeek(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);
  let bugsThisWeek = 0;
  let bugsLastWeek = 0;
  for (const ticket of tickets) {
    if (ticket.category !== "bug") continue;
    const sent = ticket._creationTime;
    if (sent >= thisMonday.getTime() && sent <= now) bugsThisWeek += 1;
    else if (sent >= lastMonday.getTime() && sent < thisMonday.getTime()) bugsLastWeek += 1;
  }

  return {
    newCount,
    inProgressCount,
    doneLast30Days,
    bugsThisWeek,
    bugsChange: bugsThisWeek - bugsLastWeek,
  };
}

/**
 * Monday 00:00 of the week containing `now`, in local time. Uses Date methods rather than
 * subtracting milliseconds, so weeks with a daylight-saving change still start at midnight
 * (research R5).
 */
function startOfWeek(now: number): Date {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}
