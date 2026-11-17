import type { ReactNode } from "react";
import { formatDateTime, getPagePath } from "@/lib/inbox/format";
import { PLATFORM_LABELS } from "@/lib/platforms";
import { isSafeHttpUrl } from "@/lib/inbox/safe-url";
import type { FeedbackContext, Sender } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icons/Icon";

type ContextTableProps = {
  context: FeedbackContext;
  sender: Pick<Sender, "email" | "userId">;
  sentAt: number;
};

function Cell({ label, icon, children }: { label: string; icon: IconName; children: ReactNode }) {
  return (
    <div className="context-grid__cell">
      <dt className="text-caption">{label}</dt>
      <dd className="context-grid__value">
        <Icon name={icon} />
        {children}
      </dd>
    </div>
  );
}

export function ContextTable({ context, sender, sentAt }: ContextTableProps) {
  const pagePath = getPagePath(context.pageUrl);

  return (
    <section className="detail__section">
      <h3 className="text-section-label">Kontekst (sendt automatisk)</h3>
      <dl className="table-box context-grid">
        <Cell label="Platform" icon="globe">
          {PLATFORM_LABELS[context.platform]}
        </Cell>
        <Cell label="Side" icon="external">
          {isSafeHttpUrl(context.pageUrl) ? (
            <a href={context.pageUrl} target="_blank" rel="noopener noreferrer">
              {pagePath}
            </a>
          ) : (
            <span>{pagePath}</span>
          )}
        </Cell>
        <Cell label="Bruger" icon="user">
          {sender.email} · ID {sender.userId}
        </Cell>
        <Cell label="Browser og OS" icon="monitor">
          {context.browser} · {context.os}
        </Cell>
        <Cell label="Skærmstørrelse" icon="monitor">
          {context.screenWidth} × {context.screenHeight}
        </Cell>
        <Cell label="Tidspunkt" icon="calendar">
          {formatDateTime(sentAt)}
        </Cell>
      </dl>
    </section>
  );
}
