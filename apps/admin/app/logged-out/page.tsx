import type { Metadata } from "next";
import Link from "next/link";
import { ResetTickets } from "@/components/ResetTickets/ResetTickets";

// Outside the (admin) route group: no menu. Next.js only hides the admin pages when the admin
// leaves them, so ResetTickets clears the session's ticket changes here (spec 004, FR-008).
// No Figma design exists for this page; it uses existing classes only (plan.md Complexity
// Tracking).

export const metadata = {
  title: "Logget ud",
} satisfies Metadata;

export default function LoggedOutPage() {
  return (
    <main className="app-shell__content grid min-h-screen place-items-center">
      <div className="card message-card">
        <h1 className="text-display">Du er logget ud</h1>
        <Link href="/" className="button">
          Log ind igen
        </Link>
      </div>
      <ResetTickets />
    </main>
  );
}
