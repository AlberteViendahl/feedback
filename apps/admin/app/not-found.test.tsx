import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("root not-found page", () => {
  it("says the page does not exist and links back to the inbox, without the menu", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "Siden findes ikke" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Gå til indbakken" }).getAttribute("href")).toBe("/");
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("has no <main> of its own, so it does not nest one inside the admin layout's", () => {
    render(<NotFound />);
    expect(screen.queryByRole("main")).toBeNull();
  });
});
