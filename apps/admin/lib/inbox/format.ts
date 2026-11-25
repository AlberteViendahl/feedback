import { isSafeHttpUrl } from "./safe-url";

// Fixed time zone so pre-rendered HTML and the browser produce identical text (research R3).
const TIME_ZONE = "Europe/Copenhagen";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const shortDateFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});
const shortDateWithYearFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const oneDecimal = new Intl.NumberFormat("da-DK", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** "YYYY-MM-DD" of the Copenhagen calendar day the timestamp falls on. */
function dayKey(timestamp: number): string {
  return dayKeyFormat.format(timestamp);
}

function previousDayKey(timestamp: number): string {
  const [year, month, day] = dayKey(timestamp).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

/** Compact Danish label for how long ago something was sent (table in research R3). */
export function formatRelativeTime(sentAt: number, now: number): string {
  const elapsed = now - sentAt;
  if (elapsed < MINUTE) return "Lige nu";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min siden`;

  const sentDay = dayKey(sentAt);
  if (sentDay === dayKey(now)) return `${Math.floor(elapsed / HOUR)} t siden`;
  if (sentDay === previousDayKey(now)) return "I går";
  if (sentDay.slice(0, 4) === dayKey(now).slice(0, 4)) return shortDateFormat.format(sentAt);
  return shortDateWithYearFormat.format(sentAt);
}

/** Used before the browser knows the current time, e.g. "26. okt. 2026". */
export function formatShortDate(sentAt: number): string {
  return shortDateWithYearFormat.format(sentAt);
}

/** e.g. "28. okt. 2026, 11.42" */
export function formatDateTime(timestamp: number): string {
  return dateTimeFormat.format(timestamp);
}

export function formatTicketNumber(number: number): string {
  return `#FB-${number}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${oneDecimal.format(bytes / (1024 * 1024))} MB`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

/** The path of a web address ("/overview"); anything else is returned unchanged. */
export function getPagePath(pageUrl: string): string {
  return isSafeHttpUrl(pageUrl) ? new URL(pageUrl).pathname : pageUrl;
}
