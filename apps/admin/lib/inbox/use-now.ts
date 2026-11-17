"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

// Rounded so the snapshot stays stable within a minute.
function getSnapshot() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

function getServerSnapshot() {
  return null;
}

/**
 * The current time, read only in the browser. `null` during pre-rendering and the first
 * hydration pass, because Cache Components forbids reading the clock while rendering
 * (research R2).
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
