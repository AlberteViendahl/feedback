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
      search: "",
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

  it("stores the search exactly as typed and changes nothing else", () => {
    const before = { ...createInitialView(), selectedId: "t1", statusFilter: "done" as const };
    const view = inboxViewReducer(before, { type: "setSearch", value: "  anna " });
    expect(view).toEqual({ ...before, search: "  anna " });
  });

  it("keeps the search when selecting a ticket or changing filters", () => {
    let view = inboxViewReducer(createInitialView(), { type: "setSearch", value: "anna" });
    view = inboxViewReducer(view, { type: "select", id: "t1" });
    view = inboxViewReducer(view, { type: "setStatusFilter", value: "done" });
    view = inboxViewReducer(view, { type: "setCategoryFilter", value: "bug" });
    view = inboxViewReducer(view, { type: "setSortOrder", value: "oldest" });
    expect(view.search).toBe("anna");
  });

  it("edits the reply draft", () => {
    const view = inboxViewReducer(createInitialView(), { type: "editReply", text: "Hej" });
    expect(view.replyDraft).toBe("Hej");
  });

  it("shows a notice", () => {
    const view = inboxViewReducer(createInitialView(), { type: "showNotice", notice: "issue-created" });
    expect(view.notice).toBe("issue-created");
  });

  it("resets everything to the initial view", () => {
    let view = inboxViewReducer(createInitialView(), { type: "setSearch", value: "anna" });
    view = inboxViewReducer(view, { type: "select", id: "t1" });
    view = inboxViewReducer(view, { type: "setStatusFilter", value: "done" });
    view = inboxViewReducer(view, { type: "editReply", text: "kladde" });
    expect(inboxViewReducer(view, { type: "reset" })).toEqual(createInitialView());
  });

  it("does not mutate the previous view", () => {
    const before = createInitialView();
    inboxViewReducer(before, { type: "select", id: "t1" });
    expect(before.selectedId).toBeNull();
  });
});
