/*
 * Shared data types for the admin app (Constitution II: one source of types).
 *
 * Shaped like documents in the planned Convex `feedback` table. Once `convex/schema.ts`
 * exists, replace these with `Doc<"feedback">` from `convex/_generated/dataModel` and
 * delete this module.
 */

export type FeedbackCategory = "bug" | "idea" | "general";

export type FeedbackStatus = "open" | "in_progress" | "done";

export type Platform = "geotracking" | "simpleserp";

export type Sender = {
  name?: string;
  email: string;
  userId: string;
  company: string;
  plan: string;
};

export type FeedbackContext = {
  platform: Platform;
  /** Untrusted: only linked after an http/https check. */
  pageUrl: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
};

export type Attachment =
  | { kind: "image"; fileName: string; sizeBytes: number }
  | { kind: "video"; fileName: string; durationSeconds: number };

export type Reply = {
  text: string;
  sentAt: number;
};

export type Workspace = {
  _id: string;
  name: string;
  /** Connected platforms, in display order. */
  platforms: Platform[];
};

export type AdminUser = {
  _id: string;
  name: string;
  role: string;
  workspaceId: string;
};

export type Feedback = {
  _id: string;
  /** Time the feedback was sent, in milliseconds since epoch. */
  _creationTime: number;
  number: number;
  category: FeedbackCategory;
  /** Untrusted user input: always render as plain text. */
  description: string;
  status: FeedbackStatus;
  isRead: boolean;
  githubIssueCreated: boolean;
  reply?: Reply;
  sender: Sender;
  context: FeedbackContext;
  attachments: Attachment[];
};
