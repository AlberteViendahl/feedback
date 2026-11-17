import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons/Icon";
import { PLATFORM_LABELS } from "@/lib/platforms";
import { SETTINGS_HREF, platformHref } from "@/lib/side-menu/active-href";
import type { NewCounts } from "@/lib/tickets/counts";
import type { AdminUser, Platform, Workspace } from "@/lib/types";
import { NavItem } from "./NavItem/NavItem";
import { UserBlock } from "./UserBlock/UserBlock";

type SideMenuProps = {
  workspace: Workspace;
  user: AdminUser;
  counts: NewCounts;
  activeHref: string | null;
};

const PLATFORM_ICONS: Record<Platform, { circle: IconName; glyph: IconName }> = {
  geotracking: { circle: "platform-geotracking", glyph: "nav-globe" },
  simpleserp: { circle: "platform-simpleserp", glyph: "nav-search" },
};

function PlatformIcon({ platform }: { platform: Platform }) {
  const { circle, glyph } = PLATFORM_ICONS[platform];
  return (
    <span className="icon-stack" aria-hidden="true">
      <Icon name={circle} />
      <Icon name={glyph} />
    </span>
  );
}

export function SideMenu({ workspace, user, counts, activeHref }: SideMenuProps) {
  return (
    <nav aria-label="Hovedmenu" className="side-menu">
      <Link href="/" className="brand-pill side-menu__brand">
        <strong>Feedback</strong> · Admin
      </Link>

      <div className="side-menu__scroll">
        <NavItem
          href="/"
          label={workspace.name}
          icon={<Icon name="workspace-avatar" className="shrink-0" />}
          count={counts.total}
          isActive={activeHref === "/"}
        />

        <p className="text-overline side-menu__section-label">Platforme</p>
        <div className="side-menu__platforms">
          {workspace.platforms.map((platform) => (
            <NavItem
              key={platform}
              href={platformHref(platform)}
              label={PLATFORM_LABELS[platform]}
              icon={<PlatformIcon platform={platform} />}
              count={counts.byPlatform[platform]}
              isActive={activeHref === platformHref(platform)}
            />
          ))}
        </div>
      </div>

      <div className="side-menu__footer">
        <NavItem
          href={SETTINGS_HREF}
          label="Indstillinger"
          icon={<Icon name="settings" className="shrink-0" />}
          isActive={activeHref === SETTINGS_HREF}
        />
        <div className="divider" />
        <UserBlock user={user} workspaceName={workspace.name} />
      </div>
    </nav>
  );
}
