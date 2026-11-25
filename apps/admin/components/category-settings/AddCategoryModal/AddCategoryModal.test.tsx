import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mockCategories } from "@/lib/mock-categories";
import { AddCategoryModal } from "./AddCategoryModal";

function renderModal() {
  const onAdd = vi.fn();
  const onClose = vi.fn();
  render(<AddCategoryModal categories={mockCategories} onAdd={onAdd} onClose={onClose} />);
  return { onAdd, onClose, dialog: screen.getByRole("dialog", { name: "Tilføj ny kategori" }) };
}

const nameField = () => screen.getByRole("textbox", { name: "Kategorinavn" });
const addButton = () => screen.getByRole("button", { name: "Tilføj kategori" }) as HTMLButtonElement;

async function fillIn(name: string, icon = "Indbakke", color = "Blå") {
  if (name) await userEvent.type(nameField(), name);
  await userEvent.click(screen.getByRole("radio", { name: icon }));
  await userEvent.click(screen.getByRole("radio", { name: color }));
}

describe("AddCategoryModal – adding (US1)", () => {
  it("opens as a dialog with the Danish texts", () => {
    const { dialog } = renderModal();
    expect(dialog.hasAttribute("open")).toBe(true);
    const view = within(dialog);
    expect(view.getByText("Giv AI'en en ny måde at sortere feedback på.")).toBeTruthy();
    expect((nameField() as HTMLInputElement).placeholder).toBe("f.eks. Forbedring");
    expect(view.getByText("AI'en kan vælge kategorien, når den sorterer feedback.")).toBeTruthy();
    expect(view.getByRole("group", { name: /Kategori-ikon/ }).textContent).toContain("Vælg én");
    expect(view.getByRole("group", { name: "Kategorifarve" })).toBeTruthy();
    expect(view.getByRole("button", { name: "Annuller" })).toBeTruthy();
  });

  it("starts with an empty, focused name and nothing chosen (FR-005)", () => {
    renderModal();
    expect((nameField() as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(nameField());
    expect(screen.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(0);
  });

  it("offers seven icons and eight colours with Danish names (FR-019, FR-020)", () => {
    renderModal();
    const icons = within(screen.getByRole("group", { name: /Kategori-ikon/ })).getAllByRole("radio");
    expect(icons.map((radio) => radio.closest("label")?.textContent)).toEqual([
      "Idé",
      "Fejl",
      "Besked",
      "Indbakke",
      "Vedhæftning",
      "Forgrening",
      "Fremskridt",
    ]);
    const colors = within(screen.getByRole("group", { name: "Kategorifarve" })).getAllByRole("radio");
    expect(colors.map((radio) => radio.closest("label")?.textContent)).toEqual([
      "Rød",
      "Orange",
      "Gul",
      "Grøn",
      "Turkis",
      "Blå",
      "Lilla",
      "Pink",
    ]);
  });

  it("keeps one icon and one colour chosen at a time (FR-021)", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("radio", { name: "Idé" }));
    await userEvent.click(screen.getByRole("radio", { name: "Fejl" }));
    expect((screen.getByRole("radio", { name: "Idé" }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("radio", { name: "Fejl" }) as HTMLInputElement).checked).toBe(true);
  });

  it("can only add once a name, an icon and a colour are chosen (FR-008)", async () => {
    renderModal();
    expect(addButton().disabled).toBe(true);
    await userEvent.type(nameField(), "Forbedring");
    expect(addButton().disabled).toBe(true);
    await userEvent.click(screen.getByRole("radio", { name: "Indbakke" }));
    expect(addButton().disabled).toBe(true);
    await userEvent.click(screen.getByRole("radio", { name: "Blå" }));
    expect(addButton().disabled).toBe(false);
  });

  it("adds with the button", async () => {
    const { onAdd } = renderModal();
    await fillIn("Forbedring");
    await userEvent.click(addButton());
    expect(onAdd).toHaveBeenCalledWith({ name: "Forbedring", icon: "inbox", color: "blue" });
  });

  it("adds with Enter in the name field (FR-006)", async () => {
    const { onAdd } = renderModal();
    await fillIn("");
    await userEvent.type(nameField(), "Forbedring{Enter}");
    expect(onAdd).toHaveBeenCalledWith({ name: "Forbedring", icon: "inbox", color: "blue" });
  });

  it("does nothing on Enter while something is missing", async () => {
    const { onAdd } = renderModal();
    await userEvent.type(nameField(), "Forbedring{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe("AddCategoryModal – closing (US2)", () => {
  it.each([
    ["Annuller", () => userEvent.click(screen.getByRole("button", { name: "Annuller" }))],
    ["the close button", () => userEvent.click(screen.getByRole("button", { name: "Luk" }))],
  ])("closes without adding via %s", async (_, close) => {
    const { onAdd, onClose } = renderModal();
    await fillIn("Forbedring");
    await close();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("closes without adding on Escape (the dialog's cancel event)", () => {
    const { dialog, onAdd, onClose } = renderModal();
    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("closes on a click outside the content, not on a click inside", () => {
    const { dialog, onClose } = renderModal();
    fireEvent.click(nameField());
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("AddCategoryModal – bad names (US4)", () => {
  it("cannot add a name of only spaces", async () => {
    renderModal();
    await fillIn("   ");
    expect(addButton().disabled).toBe(true);
  });

  it("refuses an existing name in any case and says so (FR-010)", async () => {
    const { onAdd } = renderModal();
    await fillIn("  fejl  ");
    await userEvent.click(addButton());
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Der findes allerede en kategori med det navn.");
    expect(nameField().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("hides the message as soon as the name changes", async () => {
    renderModal();
    await fillIn("Fejl");
    await userEvent.click(addButton());
    await userEvent.type(nameField(), "s");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("accepts at most 40 characters (FR-009)", async () => {
    renderModal();
    await userEvent.type(nameField(), "x".repeat(41));
    expect((nameField() as HTMLInputElement).value).toHaveLength(40);
  });

  it("trims spaces around the name", async () => {
    const { onAdd } = renderModal();
    await fillIn("  Forbedring  ");
    await userEvent.click(addButton());
    expect(onAdd).toHaveBeenCalledWith({ name: "Forbedring", icon: "inbox", color: "blue" });
  });
});
