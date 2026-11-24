import type { ReactNode } from "react";
import { BugIcon } from "@/components/Icons/BugIcon";
import { CheckIcon } from "@/components/Icons/CheckIcon";
import { InboxIcon } from "@/components/Icons/InboxIcon";
import { ProgressIcon } from "@/components/Icons/ProgressIcon";
import type { KeyNumbers as KeyNumbersData } from "@/lib/tickets/key-numbers";

type KeyNumbersProps = {
  numbers: KeyNumbersData;
};

const numberFormat = new Intl.NumberFormat("da-DK");

type CardProps = {
  tone: "info" | "warning" | "success" | "danger";
  icon: ReactNode;
  value: number | null;
  label: ReactNode;
};

/** Information only: nothing here can be clicked or focused (FR-009). */
function Card({ tone, icon, value, label }: CardProps) {
  return (
    <li className={`stat-card stat-card--${tone}`}>
      <span className="icon-frame">{icon}</span>
      <span>
        <span className="text-stat block">{value === null ? "–" : numberFormat.format(value)}</span>
        <span className="text-meta block">{label}</span>
      </span>
    </li>
  );
}

/** The key numbers above the inbox (spec 005). `null` numbers wait for the current time. */
export function KeyNumbers({ numbers }: KeyNumbersProps) {
  return (
    <ul className="key-numbers" aria-label="Nøgletal">
      <Card tone="info" icon={<InboxIcon />} value={numbers.newCount} label="Nye · ikke åbnet endnu" />
      <Card tone="warning" icon={<ProgressIcon />} value={numbers.inProgressCount} label="I gang" />
      <Card
        tone="success"
        icon={<CheckIcon />}
        value={numbers.doneLast30Days}
        label="Færdige · sidste 30 dage"
      />
      <Card
        tone="danger"
        icon={<BugIcon />}
        value={numbers.bugsThisWeek}
        label={
          <>
            Fejl denne uge
            <BugsChange change={numbers.bugsChange} />
          </>
        }
      />
    </ul>
  );
}

/** " · ↑ 3" against last week; screen readers hear "3 flere end sidste uge" instead of the arrow. */
function BugsChange({ change }: { change: number | null }) {
  if (change === null || change === 0) return null;
  const size = Math.abs(change);
  return (
    <>
      {" · "}
      <span aria-hidden="true">{change > 0 ? `↑ ${size}` : `↓ ${size}`}</span>
      <span className="sr-only">
        {size} {change > 0 ? "flere" : "færre"} end sidste uge
      </span>
    </>
  );
}
