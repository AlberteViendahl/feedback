import { describe, expect, it } from "vitest";
import { PLATFORMS, PLATFORM_LABELS, isPlatform } from "./platforms";

describe("platforms", () => {
  it("lists every known platform with a display name", () => {
    expect(PLATFORMS).toEqual(["geotracking", "simpleserp"]);
    expect(PLATFORM_LABELS).toEqual({ geotracking: "GEOtracking", simpleserp: "SimpleSERP" });
  });

  it.each(["geotracking", "simpleserp"])("recognises %s", (value) => {
    expect(isPlatform(value)).toBe(true);
  });

  it.each(["foo", "", "GEOtracking"])("rejects %j", (value) => {
    expect(isPlatform(value)).toBe(false);
  });
});
