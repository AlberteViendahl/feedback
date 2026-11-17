import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttachmentList } from "./AttachmentList";

describe("AttachmentList", () => {
  it("renders nothing without attachments", () => {
    const { container } = render(<AttachmentList attachments={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows a count heading and one card per file", () => {
    render(
      <AttachmentList
        attachments={[
          { kind: "image", fileName: "screenshot-overview.png", sizeBytes: 1_258_291 },
          { kind: "video", fileName: "screen-recording.mp4", durationSeconds: 14 },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Vedhæftede filer (2)" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("screenshot-overview.png")).toBeTruthy();
    expect(screen.getByText("· 1,2 MB")).toBeTruthy();
    expect(screen.getByText("· 0:14")).toBeTruthy();
  });

  it("shows a play symbol only for videos", () => {
    render(<AttachmentList attachments={[{ kind: "image", fileName: "a.png", sizeBytes: 10 }]} />);
    expect(screen.getByAltText("Billede")).toBeTruthy();
    expect(screen.queryByAltText("Video")).toBeNull();
  });

  it("shows file names as literal text", () => {
    render(
      <AttachmentList
        attachments={[{ kind: "image", fileName: "<script>alert(1)</script>.png", sizeBytes: 10 }]}
      />,
    );
    expect(screen.getByText("<script>alert(1)</script>.png")).toBeTruthy();
  });
});
