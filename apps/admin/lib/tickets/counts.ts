import { PLATFORMS } from "@/lib/platforms";
import type { Feedback, Platform } from "@/lib/types";

/** New (unopened) feedback per platform and for the whole workspace. */
export type NewCounts = {
  total: number;
  byPlatform: Record<Platform, number>;
};

export function getNewCounts(tickets: Feedback[]): NewCounts {
  const byPlatform = Object.fromEntries(PLATFORMS.map((platform) => [platform, 0])) as Record<
    Platform,
    number
  >;
  for (const ticket of tickets) {
    if (!ticket.isRead) byPlatform[ticket.context.platform] += 1;
  }
  const total = Object.values(byPlatform).reduce((sum, count) => sum + count, 0);
  return { total, byPlatform };
}

/** "1 ny" / "4 nye"; null for 0 so the UI can hide it (FR-005). */
export function formatNewCount(count: number): string | null {
  if (count === 0) return null;
  return count === 1 ? "1 ny" : `${count} nye`;
}
