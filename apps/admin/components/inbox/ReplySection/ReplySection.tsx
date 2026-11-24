import { formatDateTime } from "@/lib/inbox/format";
import type { InboxNotice } from "@/lib/inbox/state";
import type { Reply } from "@/lib/types";
import { BranchIcon } from "@/components/Icons/BranchIcon";
import { Icon } from "@/components/Icons/Icon";

type ReplySectionProps = {
  /** Set once a reply has been sent: shown read-only instead of the field. */
  reply: Reply | undefined;
  replyDraft: string;
  onReplyDraftChange: (text: string) => void;
};

/** The reply field, or the sent reply. Sits in the scrolling part of the panel. */
export function ReplySection({ reply, replyDraft, onReplyDraftChange }: ReplySectionProps) {
  if (reply) {
    return (
      <section className="detail__section">
        <h3 className="reply-label">Sendt svar · {formatDateTime(reply.sentAt)}</h3>
        <p className="textarea text-body reply-sent">{reply.text}</p>
      </section>
    );
  }

  return (
    <label className="detail__section">
      <span className="reply-label">Svar kunden – du kan ændre i det automatiske svar</span>
      <textarea
        className="textarea reply-field"
        value={replyDraft}
        onChange={(event) => onReplyDraftChange(event.target.value)}
        rows={2}
      />
    </label>
  );
}

type ReplyActionsProps = {
  reply: Reply | undefined;
  replyDraft: string;
  githubIssueCreated: boolean;
  notice: InboxNotice;
  onSendReply: () => void;
  onCreateIssue: () => void;
};

const NOTICE_TEXT: Record<Exclude<InboxNotice, null>, string> = {
  "reply-sent": "Svaret er sendt.",
  "issue-created": "GitHub-issue er oprettet.",
};

/** Confirmation and the two actions, pinned to the bottom of the panel. */
export function ReplyActions({
  reply,
  replyDraft,
  githubIssueCreated,
  notice,
  onSendReply,
  onCreateIssue,
}: ReplyActionsProps) {
  return (
    <footer className="detail__footer">
      {/* Always rendered so screen readers announce the text when it appears. */}
      <p role="status" className="text-meta">
        {notice ? NOTICE_TEXT[notice] : ""}
      </p>
      <div className="detail__actions">
        {!githubIssueCreated && (
          <button type="button" className="button" onClick={onCreateIssue}>
            <BranchIcon />
            Opret GitHub-issue
          </button>
        )}
        {!reply && (
          <button
            type="button"
            className="button"
            onClick={onSendReply}
            disabled={replyDraft.trim() === ""}
          >
            <Icon name="reply" />
            Færdig/send
          </button>
        )}
      </div>
    </footer>
  );
}
