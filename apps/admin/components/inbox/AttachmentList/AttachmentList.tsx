import { formatDuration, formatFileSize } from "@/lib/inbox/format";
import type { Attachment } from "@/lib/types";
import { Icon } from "@/components/Icons/Icon";

type AttachmentListProps = {
  attachments: Attachment[];
};

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <section className="detail__section">
      <h3 className="text-section-label">Vedhæftede filer ({attachments.length})</h3>
      <ul className="attachment-grid">
        {attachments.map((attachment, index) => (
          <li key={`${attachment.fileName}-${index}`} className="attachment">
            <div className="attachment__preview">
              {attachment.kind === "image" ? (
                <Icon name="image" alt="Billede" />
              ) : (
                <>
                  <Icon name="play-circle" alt="" />
                  <Icon name="play" alt="Video" />
                </>
              )}
            </div>
            <p className="attachment__caption">
              <span className="attachment__name truncate-line">
                {attachment.fileName}
              </span>
              <span className="text-caption shrink-0">
                ·{" "}
                {attachment.kind === "image"
                  ? formatFileSize(attachment.sizeBytes)
                  : formatDuration(attachment.durationSeconds)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
