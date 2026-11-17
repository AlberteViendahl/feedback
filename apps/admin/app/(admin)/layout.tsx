import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { mockFeedback } from "@/lib/mock-feedback";

// The one place that knows where admin data comes from. Today: mock data. Later: Convex.
// Layouts keep their state across navigation, so ticket changes survive switching pages.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <TicketsProvider initialTickets={mockFeedback}>
      <div className="app-shell">
        <main className="app-shell__content">{children}</main>
      </div>
    </TicketsProvider>
  );
}
