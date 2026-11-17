import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminNotFound from "./not-found";

describe("admin not-found page", () => {
  it("says the page does not exist and links back to the inbox", () => {
    render(<AdminNotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "Siden findes ikke" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Gå til indbakken" }).getAttribute("href")).toBe("/");
  });
});
