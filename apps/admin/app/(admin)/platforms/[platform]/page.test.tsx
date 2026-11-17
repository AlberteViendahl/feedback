import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlatformPage, { generateMetadata, generateStaticParams } from "./page";

function props(platform: string) {
  return { params: Promise.resolve({ platform }), searchParams: Promise.resolve({}) };
}

// Vitest cannot render async Server Components through React, so the page is called as a
// function and its result rendered (research R11).
describe("platform page", () => {
  it("states which platform it is (US2-2)", async () => {
    render(await PlatformPage(props("geotracking")));
    expect(screen.getByRole("heading", { level: 1, name: "GEOtracking" })).toBeTruthy();
    expect(screen.getByText("Denne side er tom indtil videre.")).toBeTruthy();
  });

  it("rejects unknown platforms with notFound()", async () => {
    await expect(PlatformPage(props("foo"))).rejects.toThrow();
  });

  it("prerenders both platforms", () => {
    expect(generateStaticParams()).toEqual([{ platform: "geotracking" }, { platform: "simpleserp" }]);
  });

  it("uses the platform name as page title", async () => {
    expect(await generateMetadata(props("simpleserp"))).toEqual({ title: "SimpleSERP" });
  });
});
