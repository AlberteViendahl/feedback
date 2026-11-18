import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  it("shows the upper-cased initial", () => {
    render(<UserAvatar name="hussein" />);
    expect(screen.getByText("H")).toBeTruthy();
  });

  it("is hidden from screen readers", () => {
    render(<UserAvatar name="Hussein" />);
    expect(screen.getByText("H").closest("[aria-hidden='true']")).toBeTruthy();
  });
});
