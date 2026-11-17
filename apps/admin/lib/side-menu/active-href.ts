import type { Platform } from "@/lib/types";

export const SETTINGS_HREF = "/settings";

export function platformHref(platform: Platform): string {
  return `/platforms/${platform}`;
}

/** Every page the menu links to, in menu order. */
export function getMenuHrefs(platforms: Platform[]): string[] {
  return ["/", ...platforms.map(platformHref), SETTINGS_HREF];
}

/** The menu target that equals the current URL, or null (e.g. on a not-found page). */
export function getActiveHref(pathname: string, hrefs: string[]): string | null {
  return hrefs.find((href) => href === pathname) ?? null;
}
