import { Inbox } from "@/components/inbox/Inbox";

// `/`: all feedback for the workspace. The data comes from the ticket store (lib/tickets/store.ts).
export default function Home() {
  return <Inbox />;
}
