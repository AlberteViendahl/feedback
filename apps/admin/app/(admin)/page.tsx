import { InboxContainer } from "@/components/inbox/InboxContainer";

// `/`: all feedback for the workspace. The data comes from the ticket store (lib/tickets/store.ts).
export default function Home() {
  return <InboxContainer />;
}
