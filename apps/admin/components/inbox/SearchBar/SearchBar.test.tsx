import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

/** Holds the value like Inbox does, and records every reported change. */
function renderSearchBar(initial = "") {
  const onChange = vi.fn();
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <SearchBar
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  }
  render(<Harness />);
  return { onChange, field: screen.getByRole("searchbox", { name: "Søg i feedback" }) };
}

describe("SearchBar", () => {
  it("is a search landmark holding a labelled search field with the Danish placeholder", () => {
    renderSearchBar();
    const landmark = screen.getByRole("search");
    const field = within(landmark).getByRole("searchbox", { name: "Søg i feedback" });
    expect(field.getAttribute("placeholder")).toBe("Søg i feedback, brugere, sider…");
    expect(field.getAttribute("type")).toBe("search");
  });

  it("shows the value it is given", () => {
    const { field } = renderSearchBar("anna");
    expect((field as HTMLInputElement).value).toBe("anna");
  });

  it("reports every change, untrimmed", async () => {
    const { onChange, field } = renderSearchBar();
    await userEvent.type(field, "a b");
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(["a", "a ", "a b"]);
  });

  it("clears the field on Escape and keeps the focus there", async () => {
    const { onChange, field } = renderSearchBar("abc");
    await userEvent.click(field);
    await userEvent.keyboard("{Escape}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("");
    expect((field as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(field);
  });

  it("does nothing on Escape when the field is already empty", async () => {
    const { onChange, field } = renderSearchBar();
    await userEvent.click(field);
    await userEvent.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does nothing on Enter", async () => {
    const { onChange, field } = renderSearchBar("anna");
    await userEvent.click(field);
    await userEvent.keyboard("{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect((field as HTMLInputElement).value).toBe("anna");
  });
});
