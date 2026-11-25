import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity } from "react";
import { describe, expect, it } from "vitest";
import { CategorySettings } from "./CategorySettings";

const list = () => within(screen.getByRole("region", { name: "Kategorier" })).getByRole("list");
const names = () => within(list()).getAllByRole("listitem").map((item) => item.textContent);
const addButton = () => screen.getByRole("button", { name: "Tilføj ny kategori" });

async function openAndFill(name: string) {
  await userEvent.click(addButton());
  await userEvent.type(screen.getByRole("textbox", { name: "Kategorinavn" }), name);
  await userEvent.click(screen.getByRole("radio", { name: "Indbakke" }));
  await userEvent.click(screen.getByRole("radio", { name: "Blå" }));
}

describe("CategorySettings – adding (US1)", () => {
  it("lists the built-in categories under the card's Danish title (FR-001, FR-002)", () => {
    render(<CategorySettings />);
    expect(screen.getByText("Det AI'en kan sortere feedback i")).toBeTruthy();
    expect(names()).toEqual(["Fejl", "Forslag", "Generel feedback"]);
  });

  it("opens the dialog from the button (FR-003)", async () => {
    render(<CategorySettings />);
    await userEvent.click(addButton());
    expect(screen.getByRole("dialog", { name: "Tilføj ny kategori" })).toBeTruthy();
  });

  it("adds the category last with its icon and colour, then focuses the button (FR-006, FR-011)", async () => {
    render(<CategorySettings />);
    await openAndFill("Forbedring");
    await userEvent.click(screen.getByRole("button", { name: "Tilføj kategori" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(names()).toEqual(["Fejl", "Forslag", "Generel feedback", "Forbedring"]);
    const added = within(list()).getAllByRole("listitem").at(-1)!;
    expect(added.querySelector(".category-badge")?.className).toBe("category-badge category-badge--blue");
    expect(document.activeElement).toBe(addButton());
  });

  it("keeps an added category when the card is shown again in the same session (Story 1-6)", async () => {
    const { unmount } = render(<CategorySettings />);
    await openAndFill("Forbedring");
    await userEvent.click(screen.getByRole("button", { name: "Tilføj kategori" }));
    unmount();
    render(<CategorySettings />);
    expect(names()).toContain("Forbedring");
  });
});

describe("CategorySettings – changing your mind (US2)", () => {
  it("adds nothing on Annuller, and the next opening is empty", async () => {
    render(<CategorySettings />);
    await openAndFill("Forbedring");
    await userEvent.click(screen.getByRole("button", { name: "Annuller" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(names()).toHaveLength(3);
    expect(document.activeElement).toBe(addButton());

    await userEvent.click(addButton());
    expect((screen.getByRole("textbox", { name: "Kategorinavn" }) as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("radio").some((radio) => (radio as HTMLInputElement).checked)).toBe(false);
  });

  it("closes the dialog when Next.js hides the page (research R12)", async () => {
    function Page({ mode }: { mode: "visible" | "hidden" }) {
      return (
        <Activity mode={mode}>
          <CategorySettings />
        </Activity>
      );
    }
    const { rerender } = render(<Page mode="visible" />);
    await userEvent.click(addButton());
    rerender(<Page mode="hidden" />);
    rerender(<Page mode="visible" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("CategorySettings – switching on and off (US3)", () => {
  const switchFor = (name: string) => screen.getByRole("switch", { name });

  it("starts with every category on (FR-016)", () => {
    render(<CategorySettings />);
    expect(screen.getAllByRole("switch").map((toggle) => toggle.getAttribute("aria-checked"))).toEqual([
      "true",
      "true",
      "true",
    ]);
  });

  it("adds new categories switched on", async () => {
    render(<CategorySettings />);
    await openAndFill("Forbedring");
    await userEvent.click(screen.getByRole("button", { name: "Tilføj kategori" }));
    expect(switchFor("Forbedring").getAttribute("aria-checked")).toBe("true");
  });

  it("switches one category off and keeps it off when shown again", async () => {
    const { unmount } = render(<CategorySettings />);
    await userEvent.click(switchFor("Generel feedback"));
    expect(switchFor("Generel feedback").getAttribute("aria-checked")).toBe("false");
    expect(switchFor("Fejl").getAttribute("aria-checked")).toBe("true");

    unmount();
    render(<CategorySettings />);
    expect(switchFor("Generel feedback").getAttribute("aria-checked")).toBe("false");
  });
});
