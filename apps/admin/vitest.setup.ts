import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetTickets } from "@/lib/tickets/store";

// Without Vitest globals, Testing Library does not unmount between tests on its own.
// The ticket store outlives a render: start every test from the mock data (spec 004, research R6).
afterEach(() => {
  cleanup();
  resetTickets();
});
