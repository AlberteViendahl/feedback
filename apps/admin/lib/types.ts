/*
 * Shared data types for the admin app (Constitution II: one source of types).
 *
 * Shaped like documents in the planned Convex `feedback` table. Once `convex/schema.ts`
 * exists, replace these with `Doc<"feedback">` from `convex/_generated/dataModel` and
 * delete this module.
 */

export type CategoryIcon =
  | "lightbulb"
  | "bug"
  | "message"
  | "inbox"
  | "paperclip"
  | "branch"
  | "progress";

export type CategoryColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink";

/** Shaped like a document in the planned Convex `categories` table (spec 006). */
export type Category = {
  _id: string;
  /** Time the category was added, in milliseconds since epoch. */
  _creationTime: number;
  workspaceId: string;
  /** Untrusted user input: always render as plain text. */
  name: string;
  icon: CategoryIcon;
  color: CategoryColor;
  /** On: the (future) AI may choose this category. Spec 006. */
  isEnabled: boolean;
};

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
  /** The category's `_id`; becomes `categoryId: Id<"categories">` with Convex (spec 006, research R4). */
  category: Category["_id"];
  /** Untrusted user input: always render as plain text. */
  description: string;
  status: FeedbackStatus;
  isRead: boolean;
  githubIssueCreated: boolean;
  /** Time the ticket was completed (status done), in milliseconds since epoch. Spec 005. */
  completedAt?: number;
  reply?: Reply;
  sender: Sender;
  context: FeedbackContext;
  attachments: Attachment[];
};
