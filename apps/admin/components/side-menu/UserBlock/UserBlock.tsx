import Link from "next/link";
import { Icon } from "@/components/Icons/Icon";
import type { AdminUser } from "@/lib/types";

type UserBlockProps = {
  user: AdminUser;
  workspaceName: string;
};

export function UserBlock({ user, workspaceName }: UserBlockProps) {
  return (
    <div className="user-block">
      <span className="icon-stack" aria-hidden="true">
        <Icon name="user-avatar" />
        <span className="user-block__initial">{user.name.charAt(0).toUpperCase()}</span>
      </span>
      <div className="min-w-0">
        <p className="user-block__name truncate-line">{user.name}</p>
        <p className="text-meta truncate-line">
          {user.role} · {workspaceName}
        </p>
      </div>
      {/* Simulated log-out: leaving the (admin) area discards the session (spec 002 FR-013). */}
      <Link href="/logged-out" className="user-block__logout" aria-label="Log ud">
        <Icon name="logout" />
      </Link>
    </div>
  );
}
