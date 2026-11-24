import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArrowLeftIcon } from "./ArrowLeftIcon";
import { BranchIcon } from "./BranchIcon";
import { BugIcon } from "./BugIcon";
import { LightbulbIcon } from "./LightbulbIcon";
import { MessageIcon } from "./MessageIcon";
import { PaperclipIcon } from "./PaperclipIcon";

describe.each([
  ["ArrowLeftIcon", ArrowLeftIcon],
  ["BranchIcon", BranchIcon],
  ["BugIcon", BugIcon],
  ["LightbulbIcon", LightbulbIcon],
  ["MessageIcon", MessageIcon],
  ["PaperclipIcon", PaperclipIcon],
] as const)("%s", (_, SvgIcon) => {
  it("leaves its size to the icon-size class", () => {
    const { container } = render(<SvgIcon />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toBe("icon-size");
    expect(svg.hasAttribute("width")).toBe(false);
    expect(svg.hasAttribute("height")).toBe(false);
  });

  it("adds an extra class next to icon-size", () => {
    const { container } = render(<SvgIcon className="text-muted" />);
    expect(container.querySelector("svg")!.getAttribute("class")).toBe("icon-size text-muted");
  });

  it("is hidden from screen readers", () => {
    const { container } = render(<SvgIcon />);
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("PaperclipIcon with a label", () => {
  it("is announced as an image with that name", () => {
    render(<PaperclipIcon label="Vedhæftede filer" />);
    expect(screen.getByRole("img", { name: "Vedhæftede filer" }).hasAttribute("aria-hidden")).toBe(false);
  });
});
