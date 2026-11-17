import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { STANDARD_REPLY } from "@/lib/inbox/state";
import { at } from "@/lib/inbox/test-fixtures";
import { ReplyActions, ReplySection } from "./ReplySection";

const sentReply = { text: "Tak for din besked.\nVi vender tilbage.", sentAt: at("2026-10-28T11:42:00+01:00") };

describe("ReplySection", () => {
  it("shows an editable field with the draft", async () => {
    const onReplyDraftChange = vi.fn();
    render(<ReplySection reply={undefined} replyDraft={STANDARD_REPLY} onReplyDraftChange={onReplyDraftChange} />);

    const field = screen.getByRole("textbox", { name: "Svar kunden – du kan ændre i det automatiske svar" });
    expect((field as HTMLTextAreaElement).value).toBe(STANDARD_REPLY);

    await userEvent.type(field, "!");
    expect(onReplyDraftChange).toHaveBeenLastCalledWith(`${STANDARD_REPLY}!`);
  });

  it("shows the sent reply read-only instead of the field", () => {
    render(<ReplySection reply={sentReply} replyDraft="" onReplyDraftChange={() => {}} />);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("heading", { name: "Sendt svar · 28. okt. 2026, 11.42" })).toBeTruthy();
    expect(screen.getByText(/Tak for din besked/).textContent).toBe(sentReply.text);
  });
});

function renderActions(overrides: Partial<Parameters<typeof ReplyActions>[0]> = {}) {
  const props = {
    reply: undefined,
    replyDraft: STANDARD_REPLY,
    githubIssueCreated: false,
    notice: null,
    onSendReply: vi.fn(),
    onCreateIssue: vi.fn(),
    ...overrides,
  };
  render(<ReplyActions {...props} />);
  return props;
}

describe("ReplyActions", () => {
  it("offers both actions and reports clicks", async () => {
    const props = renderActions();
    await userEvent.click(screen.getByRole("button", { name: "Opret GitHub-issue" }));
    await userEvent.click(screen.getByRole("button", { name: "Færdig/send" }));
    expect(props.onCreateIssue).toHaveBeenCalledOnce();
    expect(props.onSendReply).toHaveBeenCalledOnce();
  });

  it("disables sending while the draft is blank", () => {
    renderActions({ replyDraft: "   " });
    expect((screen.getByRole("button", { name: "Færdig/send" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("hides sending once a reply exists", () => {
    renderActions({ reply: sentReply });
    expect(screen.queryByRole("button", { name: "Færdig/send" })).toBeNull();
  });

  it("hides the GitHub action once an issue exists", () => {
    renderActions({ githubIssueCreated: true });
    expect(screen.queryByRole("button", { name: "Opret GitHub-issue" })).toBeNull();
  });

  it.each([
    ["reply-sent", "Svaret er sendt."],
    ["issue-created", "GitHub-issue er oprettet."],
  ] as const)("announces the %s notice", (notice, text) => {
    renderActions({ notice });
    expect(screen.getByRole("status").textContent).toBe(text);
  });
});
