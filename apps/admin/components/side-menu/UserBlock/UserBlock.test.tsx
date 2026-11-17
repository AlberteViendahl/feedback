import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserBlock } from "./UserBlock";

const user = { _id: "u", name: "hussein", role: "Admin", workspaceId: "ws" };

describe("UserBlock", () => {
  it("shows the initial, name, role and workspace", () => {
    render(<UserBlock user={{ ...user, name: "Hussein" }} workspaceName="Organic Growth" />);
    expect(screen.getByText("H")).toBeTruthy();
    expect(screen.getByText("Hussein")).toBeTruthy();
    expect(screen.getByText("Admin · Organic Growth")).toBeTruthy();
  });

  it("upper-cases the initial", () => {
    render(<UserBlock user={user} workspaceName="Organic Growth" />);
    expect(screen.getByText("H")).toBeTruthy();
  });

  it("logs out with one link labelled Log ud", () => {
    render(<UserBlock user={user} workspaceName="Organic Growth" />);
    expect(screen.getByRole("link", { name: "Log ud" }).getAttribute("href")).toBe("/logged-out");
  });
});
