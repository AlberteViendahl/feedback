import { formatDateTime, formatTicketNumber } from "@/lib/inbox/format";
import type { InboxNotice } from "@/lib/inbox/state";
import type { Category, Feedback } from "@/lib/types";
import { AttachmentList } from "../AttachmentList/AttachmentList";
import { ContextTable } from "../ContextTable/ContextTable";
import { BugIcon } from "@/components/Icons/BugIcon";
import { ReplyActions, ReplySection } from "../ReplySection/ReplySection";

type TicketDetailProps = {
  ticket: Feedback | null;
  /** The open ticket's category; undefined shows no name. */
  category: Category | undefined;
  replyDraft: string;
  notice: InboxNotice;
  onReplyDraftChange: (text: string) => void;
  onSendReply: () => void;
  onCreateIssue: () => void;
};

export function TicketDetail({
  ticket,
  category,
  replyDraft,
  notice,
  onReplyDraftChange,
  onSendReply,
  onCreateIssue,
}: TicketDetailProps) {
  if (!ticket) {
    return <p className="inbox__empty">Vælg en feedback i listen for at se detaljerne.</p>;
  }

  const { sender } = ticket;
  const displayName = sender.name ?? sender.email;

  return (
    <>
      <header className="detail__header">
        <span className="chip">
          {/* Figma only has a small icon for Fejl (FR-012). */}
          {ticket.category === "bug" && <BugIcon />}
          {category?.name}
        </span>
        <h2 className="detail__number">{formatTicketNumber(ticket.number)}</h2>
      </header>

      <div className="inbox__scroll overflow-y-auto">
        <div className="detail__body">
          <div className="detail__sender">
            <span className="avatar" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p>
                <span className="detail__sender-name">{displayName}</span>
                {sender.name && <span className="detail__sender-email"> · {sender.email}</span>}
              </p>
              <p className="text-meta">
                {sender.company} · {sender.plan} · Sendt {formatDateTime(ticket._creationTime)}
              </p>
            </div>
          </div>

          <p className="text-body detail__description">{ticket.description}</p>

          <AttachmentList attachments={ticket.attachments} />
          <ContextTable context={ticket.context} sender={sender} sentAt={ticket._creationTime} />
          <ReplySection
            reply={ticket.reply}
            replyDraft={replyDraft}
            onReplyDraftChange={onReplyDraftChange}
          />
        </div>
      </div>

      <ReplyActions
        reply={ticket.reply}
        replyDraft={replyDraft}
        githubIssueCreated={ticket.githubIssueCreated}
        notice={notice}
        onSendReply={onSendReply}
        onCreateIssue={onCreateIssue}
      />
    </>
  );
}
