import { Inbox } from "@/components/inbox/Inbox";
import { mockFeedback } from "@/lib/mock-feedback";

// The one place that knows where tickets come from. Today: mock data. Later: Convex.
export default function Home() {
  return (
    <main className="p-[var(--page-padding)]">
      <Inbox initialTickets={mockFeedback} />
    </main>
  );
}
