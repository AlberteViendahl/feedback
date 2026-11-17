import Link from "next/link";
import type { ReactNode } from "react";
import { formatNewCount } from "@/lib/tickets/counts";

type NavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  /** New feedback; hidden when undefined or 0. */
  count?: number;
  isActive: boolean;
};

export function NavItem({ href, label, icon, count, isActive }: NavItemProps) {
  const countText = count === undefined ? null : formatNewCount(count);

  return (
    <Link
      href={href}
      className={isActive ? "nav-item nav-item--active" : "nav-item"}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="truncate-line">{label}</span>
      {countText && <span className="nav-item__count">{countText}</span>}
    </Link>
  );
}
