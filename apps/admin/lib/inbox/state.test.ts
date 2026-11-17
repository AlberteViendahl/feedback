import { describe, expect, it } from "vitest";
import { STANDARD_REPLY, createInitialView, inboxViewReducer } from "./state";

describe("createInitialView", () => {
  it("starts with default filters, nothing selected and the standard reply", () => {
    expect(createInitialView()).toEqual({
      statusFilter: "all",
      categoryFilter: "all",
      sortOrder: "newest",
      selectedId: null,
      replyDraft: STANDARD_REPLY,
      notice: null,
    });
  });
});

describe("inboxViewReducer", () => {
  it("selects a ticket and resets the draft and notice", () => {
    const edited = { ...createInitialView(), replyDraft: "kladde", notice: "reply-sent" as const };
    const view = inboxViewReducer(edited, { type: "select", id: "t1" });
    expect(view).toMatchObject({ selectedId: "t1", replyDraft: STANDARD_REPLY, notice: null });
  });

  it("stores filters and sort order", () => {
    let view = createInitialView();
    view = inboxViewReducer(view, { type: "setStatusFilter", value: "done" });
    view = inboxViewReducer(view, { type: "setCategoryFilter", value: "idea" });
    view = inboxViewReducer(view, { type: "setSortOrder", value: "oldest" });
    expect(view).toMatchObject({ statusFilter: "done", categoryFilter: "idea", sortOrder: "oldest" });
  });

  it("edits the reply draft", () => {
    const view = inboxViewReducer(createInitialView(), { type: "editReply", text: "Hej" });
    expect(view.replyDraft).toBe("Hej");
  });

  it("shows a notice", () => {
    const view = inboxViewReducer(createInitialView(), { type: "showNotice", notice: "issue-created" });
    expect(view.notice).toBe("issue-created");
  });

  it("does not mutate the previous view", () => {
    const before = createInitialView();
    inboxViewReducer(before, { type: "select", id: "t1" });
    expect(before.selectedId).toBeNull();
  });
});
