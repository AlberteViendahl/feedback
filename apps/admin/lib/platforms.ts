import type { Platform } from "@/lib/types";

export const PLATFORMS = ["geotracking", "simpleserp"] as const satisfies readonly Platform[];

export const PLATFORM_LABELS: Record<Platform, string> = {
  geotracking: "GEOtracking",
  simpleserp: "SimpleSERP",
};

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}
