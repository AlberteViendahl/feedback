"use client";

import { useEffect } from "react";
import { resetTickets } from "@/lib/tickets/store";

/**
 * Clears the session's ticket changes whenever it is shown: on mount, and each time Next.js shows
 * the page again after hiding it with Activity (spec 004, research R5). Renders nothing.
 */
export function ResetTickets() {
  useEffect(() => resetTickets(), []);
  return null;
}
