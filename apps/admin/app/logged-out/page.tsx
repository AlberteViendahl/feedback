import type { Metadata } from "next";
import Link from "next/link";

// Outside the (admin) route group: no menu, and no TicketsProvider, so the session's ticket
// changes are gone after "logging out" (spec 002, FR-013). No Figma design exists for this
// page; it uses existing classes only (plan.md Complexity Tracking).

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
    </main>
  );
}
