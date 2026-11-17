import { Suspense } from "react";
import { SideMenuContainer } from "@/components/side-menu/SideMenuContainer";
import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { mockFeedback } from "@/lib/mock-feedback";
import { mockUser, mockWorkspace } from "@/lib/mock-workspace";

// The one place that knows where admin data comes from. Today: mock data. Later: Convex.
// Layouts keep their state across navigation, so ticket changes survive switching pages.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <TicketsProvider initialTickets={mockFeedback}>
      <div className="app-shell">
        <aside className="app-shell__menu sidebar">
          {/* The highlight reads the URL, which suspends on unknown platform URLs (research R5). */}
          <Suspense
            fallback={
              <SideMenuContainer workspace={mockWorkspace} user={mockUser} activeHref={null} />
            }
          >
            <SideMenuContainer workspace={mockWorkspace} user={mockUser} />
          </Suspense>
        </aside>
        <main className="app-shell__content">{children}</main>
      </div>
    </TicketsProvider>
  );
}
