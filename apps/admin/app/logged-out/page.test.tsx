import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoggedOutPage, { metadata } from "./page";

describe("logged-out page", () => {
  it("confirms the log-out and offers to log in again (US3-2, US3-3)", () => {
    render(<LoggedOutPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Du er logget ud" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Log ind igen" }).getAttribute("href")).toBe("/");
  });

  it("does not show the side menu", () => {
    render(<LoggedOutPage />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("has its own page title", () => {
    expect(metadata.title).toBe("Logget ud");
  });
});
