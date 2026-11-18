import type { Ref } from "react";
import { UserAvatar } from "@/components/UserAvatar/UserAvatar";

type TopBarProps = {
  userName: string;
  /** The id of the side menu the button opens. */
  menuId: string;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  menuButtonRef?: Ref<HTMLButtonElement>;
};

/** Header on tablet and mobile, where the side menu is a drawer. CSS hides it on desktop. */
export function TopBar({ userName, menuId, isMenuOpen, onOpenMenu, menuButtonRef }: TopBarProps) {
  return (
    <header className="top-bar" inert={isMenuOpen}>
      <button
        ref={menuButtonRef}
        type="button"
        className="top-bar__menu-button"
        aria-label="Åbn menu"
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        onClick={onOpenMenu}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <p className="top-bar__brand">
        <strong>Feedback</strong> · Admin
      </p>
      <UserAvatar name={userName} />
    </header>
  );
}
