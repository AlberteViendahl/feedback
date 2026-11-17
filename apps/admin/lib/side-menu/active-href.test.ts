import { describe, expect, it } from "vitest";
import { getActiveHref, getMenuHrefs } from "./active-href";

const hrefs = getMenuHrefs(["geotracking", "simpleserp"]);

describe("getMenuHrefs", () => {
  it("lists the workspace, each platform and settings, in menu order", () => {
    expect(hrefs).toEqual(["/", "/platforms/geotracking", "/platforms/simpleserp", "/settings"]);
  });
});

describe("getActiveHref", () => {
  it.each(["/", "/platforms/geotracking", "/settings"])("matches %s exactly", (pathname) => {
    expect(getActiveHref(pathname, hrefs)).toBe(pathname);
  });

  it.each(["/platforms/foo", "/settings/extra", "/logged-out"])("returns null for %s", (pathname) => {
    expect(getActiveHref(pathname, hrefs)).toBeNull();
  });
});
