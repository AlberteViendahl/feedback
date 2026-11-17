import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABELS,
  formatDateTime,
  formatDuration,
  formatFileSize,
  formatRelativeTime,
  formatShortDate,
  formatTicketNumber,
  getPagePath,
} from "./format";

const at = (iso: string) => Date.parse(iso);
const now = at("2026-11-17T11:42:00+01:00");

describe("formatRelativeTime", () => {
  it.each([
    ["under 1 minute", "2026-11-17T11:41:30+01:00", "Lige nu"],
    ["sent in the future", "2026-11-17T11:43:00+01:00", "Lige nu"],
    ["1 minute", "2026-11-17T11:41:00+01:00", "1 min siden"],
    ["59 minutes", "2026-11-17T10:43:00+01:00", "59 min siden"],
    ["1 hour, same day", "2026-11-17T10:42:00+01:00", "1 t siden"],
    ["11 hours, same day", "2026-11-17T00:30:00+01:00", "11 t siden"],
    ["previous calendar day", "2026-11-16T23:50:00+01:00", "I går"],
    ["previous calendar day, early", "2026-11-16T00:05:00+01:00", "I går"],
    ["older, same year", "2026-10-26T13:05:00+01:00", "26. okt."],
    ["older, other year", "2025-10-26T13:05:00+01:00", "26. okt. 2025"],
  ])("%s", (_case, sentAt, expected) => {
    expect(formatRelativeTime(at(sentAt), now)).toBe(expected);
  });

  it("uses Copenhagen calendar days, not UTC", () => {
    // 00:30 in Copenhagen is still the previous day in UTC.
    const justAfterMidnight = at("2026-11-17T00:40:00+01:00");
    expect(formatRelativeTime(at("2026-11-17T00:10:00+01:00"), justAfterMidnight)).toBe(
      "30 min siden",
    );
    expect(formatRelativeTime(at("2026-11-16T22:40:00+01:00"), justAfterMidnight)).toBe("I går");
  });
});

describe("absolute dates", () => {
  it("formats a short date with year", () => {
    expect(formatShortDate(at("2026-10-26T13:05:00+01:00"))).toBe("26. okt. 2026");
  });

  it("formats date and time in Copenhagen time", () => {
    expect(formatDateTime(at("2026-10-28T10:42:00Z"))).toBe("28. okt. 2026, 11.42");
  });
});

describe("small formatters", () => {
  it("formats ticket numbers", () => {
    expect(formatTicketNumber(1042)).toBe("#FB-1042");
  });

  it.each([
    [512, "512 B"],
    [845_210, "825 KB"],
    [1_258_291, "1,2 MB"],
  ])("formats %d bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it.each([
    [14, "0:14"],
    [65, "1:05"],
  ])("formats %d seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it("returns the path of a web address", () => {
    expect(getPagePath("https://app.geotracking.dk/overview")).toBe("/overview");
  });

  it("returns anything that is not a web address unchanged", () => {
    expect(getPagePath("javascript:alert(1)")).toBe("javascript:alert(1)");
    expect(getPagePath("not a url")).toBe("not a url");
  });

  it("has Danish labels for categories", () => {
    expect(CATEGORY_LABELS).toEqual({ bug: "Fejl", idea: "Forslag", general: "Generel feedback" });
  });
});
