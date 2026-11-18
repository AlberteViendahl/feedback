"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/Icons/Icon";
import type { AdminUser } from "@/lib/types";
import { TopBar } from "./TopBar/TopBar";

type AppShellProps = {
  user: AdminUser;
  /** The side menu: a column on desktop, a drawer that slides in on tablet and mobile. */
  menu: ReactNode;
  children: ReactNode;
};

/**
 * Frame for the admin pages. Below the `lg` breakpoint (see globals.css) the side menu hides
 * behind the top bar's menu button and slides in over the page, which goes inert meanwhile.
 */
export function AppShell({ user, menu, children }: AppShellProps) {
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const wasMenuOpen = useRef(false);

  // Focus moves into the menu when it opens and back to the menu button when it closes.
  useEffect(() => {
    if (isMenuOpen) closeButtonRef.current?.focus();
    else if (wasMenuOpen.current) menuButtonRef.current?.focus();
    wasMenuOpen.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    // CSS hides the backdrop once the window is wider than the breakpoint: no drawer, so close.
    function handleResize() {
      const backdrop = backdropRef.current;
      if (backdrop && getComputedStyle(backdrop).display === "none") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  // Following a link in the drawer closes it, so the next page is not hidden behind it.
  function handleMenuClick(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) setIsMenuOpen(false);
  }

  return (
    <div className={isMenuOpen ? "app-shell app-shell--menu-open" : "app-shell"}>
      <TopBar
        userName={user.name}
        menuId={menuId}
        isMenuOpen={isMenuOpen}
        onOpenMenu={() => setIsMenuOpen(true)}
        menuButtonRef={menuButtonRef}
      />
      <aside id={menuId} className="app-shell__menu sidebar" onClick={handleMenuClick}>
        <button
          ref={closeButtonRef}
          type="button"
          className="app-shell__close"
          aria-label="Luk menu"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="icon-button">
            <Icon name="close" />
          </span>
        </button>
        {menu}
      </aside>
      <div
        ref={backdropRef}
        className="app-shell__backdrop"
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
      <main className="app-shell__content" inert={isMenuOpen}>
        {children}
      </main>
    </div>
  );
}
