import type { Feedback } from "@/lib/types";

// Small, readable tickets for unit and component tests.

export const at = (iso: string) => Date.parse(iso);

export function makeTicket(overrides: Partial<Feedback> & Pick<Feedback, "_id">): Feedback {
  return {
    _creationTime: at("2026-11-17T10:00:00+01:00"),
    number: 1000,
    category: "bug",
    description: "Noget virker ikke",
    status: "open",
    isRead: false,
    githubIssueCreated: false,
    sender: {
      name: "Anna Holm",
      email: "anna@company.dk",
      userId: "4821",
      company: "Company ApS",
      plan: "Pro",
    },
    context: {
      platform: "geotracking",
      pageUrl: "https://app.geotracking.dk/overview",
      browser: "Chrome 130",
      os: "macOS",
      screenWidth: 1440,
      screenHeight: 900,
    },
    attachments: [],
    ...overrides,
  };
}

/** Five tickets: every category and status, sent one hour apart (t1 newest). */
export const fixtureTickets: Feedback[] = [
  makeTicket({ _id: "t1", number: 1005, _creationTime: at("2026-11-17T11:00:00+01:00"), category: "bug", status: "open", description: "Første fejl" }),
  makeTicket({ _id: "t2", number: 1004, _creationTime: at("2026-11-17T10:00:00+01:00"), category: "idea", status: "open", isRead: true, description: "Et forslag" }),
  makeTicket({ _id: "t3", number: 1003, _creationTime: at("2026-11-17T09:00:00+01:00"), category: "bug", status: "done", completedAt: at("2026-11-17T09:30:00+01:00"), isRead: true, description: "Løst fejl" }),
  makeTicket({ _id: "t4", number: 1002, _creationTime: at("2026-11-17T08:00:00+01:00"), category: "general", status: "in_progress", isRead: true, githubIssueCreated: true, description: "Generel ros" }),
  makeTicket({ _id: "t5", number: 1001, _creationTime: at("2026-11-17T07:00:00+01:00"), category: "idea", status: "done", completedAt: at("2026-11-17T07:30:00+01:00"), isRead: true, description: "Gammelt forslag" }),
];
