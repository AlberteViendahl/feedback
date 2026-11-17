import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage, { metadata } from "./page";

describe("settings page", () => {
  it("states that it is the settings page (US2-3)", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Indstillinger" })).toBeTruthy();
    expect(screen.getByText("Denne side er tom indtil videre.")).toBeTruthy();
  });

  it("has its own page title", () => {
    expect(metadata.title).toBe("Indstillinger");
  });
});
