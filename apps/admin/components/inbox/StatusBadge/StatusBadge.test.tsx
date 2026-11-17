import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("shows Ny for unread tickets, whatever their status", () => {
    render(<StatusBadge ticket={{ isRead: false, status: "done" }} />);
    expect(screen.getByText("Ny").className).toContain("badge--new");
  });

  it("shows I gang for read tickets in progress", () => {
    render(<StatusBadge ticket={{ isRead: true, status: "in_progress" }} />);
    expect(screen.getByText("I gang").className).toContain("badge--progress");
  });

  it("shows Færdig for read done tickets", () => {
    render(<StatusBadge ticket={{ isRead: true, status: "done" }} />);
    expect(screen.getByText("Færdig").className).toContain("badge--done");
  });

  it("shows nothing for read open tickets", () => {
    const { container } = render(<StatusBadge ticket={{ isRead: true, status: "open" }} />);
    expect(container.innerHTML).toBe("");
  });
});
