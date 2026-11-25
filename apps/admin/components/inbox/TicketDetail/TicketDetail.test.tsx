import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getCategory } from "@/lib/categories/state";
import { STANDARD_REPLY } from "@/lib/inbox/state";
import { mockCategories } from "@/lib/mock-categories";
import { at, makeTicket } from "@/lib/inbox/test-fixtures";
import type { Feedback } from "@/lib/types";
import { TicketDetail } from "./TicketDetail";

const ticket = makeTicket({
  _id: "fb_1042",
  number: 1042,
  _creationTime: at("2026-10-28T11:42:00+01:00"),
  description: "Første linje.\nAnden linje.",
  attachments: [{ kind: "image", fileName: "screenshot-overview.png", sizeBytes: 1_258_291 }],
});

function renderDetail(shown: Feedback | null) {
  return render(
    <TicketDetail
      ticket={shown}
      category={shown ? getCategory(mockCategories, shown.category) : undefined}
      replyDraft={STANDARD_REPLY}
      notice={null}
      onReplyDraftChange={vi.fn()}
      onSendReply={vi.fn()}
      onCreateIssue={vi.fn()}
    />,
  );
}

describe("TicketDetail", () => {
  it("prompts to select a ticket when none is open", () => {
    renderDetail(null);
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();
  });

  it("shows category, number, sender, description, attachments and context", () => {
    renderDetail(ticket);
    expect(screen.getByText("Fejl")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "#FB-1042" })).toBeTruthy();
    expect(screen.getByText("Anna Holm")).toBeTruthy();
    expect(screen.getByText("· anna@company.dk")).toBeTruthy();
    expect(screen.getByText("Company ApS · Pro · Sendt 28. okt. 2026, 11.42")).toBeTruthy();
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Vedhæftede filer (1)" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Kontekst (sendt automatisk)" })).toBeTruthy();
  });

  it("keeps the sender's line breaks", () => {
    renderDetail(ticket);
    const description = screen.getByText(/Første linje/);
    expect(description.textContent).toBe("Første linje.\nAnden linje.");
    expect(description.className).toContain("detail__description");
  });

  it("uses the email when the sender has no name", () => {
    const anonymous = { ...ticket, sender: { ...ticket.sender, name: undefined } };
    renderDetail(anonymous);
    expect(screen.getAllByText("anna@company.dk").length).toBeGreaterThan(0);
    expect(screen.queryByText("· anna@company.dk")).toBeNull();
  });

  it("shows the bug icon only for Fejl", () => {
    const { unmount } = renderDetail(ticket);
    expect(document.querySelector(".chip svg")).not.toBeNull();
    unmount();
    renderDetail({ ...ticket, category: "idea" });
    expect(screen.getByText("Forslag")).toBeTruthy();
    expect(document.querySelector(".chip svg")).toBeNull();
  });

  it("shows markup in the description as literal text", () => {
    const markup = "<img src=x onerror=alert(1)>";
    renderDetail({ ...ticket, description: markup });
    expect(screen.getByText(markup)).toBeTruthy();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it("shows the reply field and both actions for a ticket without a reply", () => {
    renderDetail(ticket);
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Færdig/send" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Opret GitHub-issue" })).toBeTruthy();
  });

  it("shows a sent reply read-only without the send action", () => {
    renderDetail({ ...ticket, reply: { text: "Tak!", sentAt: ticket._creationTime } });
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("Tak!")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Færdig/send" })).toBeNull();
  });
});
