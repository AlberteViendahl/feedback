"use client";

import { useEffect } from "react";
import { resetCategories } from "@/lib/categories/store";
import { resetTickets } from "@/lib/tickets/store";

/**
 * Clears the session's ticket and category changes whenever it is shown: on mount, and each time
 * Next.js shows the page again after hiding it with Activity (spec 004 research R5, spec 006
 * FR-014). Renders nothing.
 */
export function ResetTickets() {
  useEffect(() => {
    resetTickets();
    resetCategories();
  }, []);
  return null;
}
