import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage, { metadata } from "./page";

describe("settings page", () => {
  it("shows the heading, the subtitle and the Categories card (spec 006, FR-001)", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Indstillinger" })).toBeTruthy();
    expect(
      screen.getByText("Opsæt feedback-widget, kategorier, notifikationer og datahåndtering"),
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "Kategorier" })).toBeTruthy();
  });

  it("has its own page title", () => {
    expect(metadata.title).toBe("Indstillinger");
  });
});
