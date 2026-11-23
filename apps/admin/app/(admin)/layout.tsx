import { Suspense } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { SideMenu } from "@/components/side-menu/SideMenu";
import { mockUser, mockWorkspace } from "@/lib/mock-workspace";

// The one place that knows where the workspace and user come from. Today: mock data. Later:
// Convex. Ticket data lives in lib/tickets/store.ts (spec 004).
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      user={mockUser}
      menu={
        // The highlight reads the URL, which suspends on unknown platform URLs (research R5).
        <Suspense
          fallback={
            <SideMenu workspace={mockWorkspace} user={mockUser} activeHref={null} /> // Istedefor en spinner så har fallback mneyen som viser, bare at ingenting er highlightet.
          }
        >
          <SideMenu workspace={mockWorkspace} user={mockUser} />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
