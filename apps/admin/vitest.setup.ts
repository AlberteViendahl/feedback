import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetCategories } from "@/lib/categories/store";
import { resetTickets } from "@/lib/tickets/store";

// jsdom 29 has HTMLDialogElement but not showModal()/close(); just enough for the add-category
// dialog (spec 006, research R8). Focus trapping and the inert page are checked by hand.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

// Without Vitest globals, Testing Library does not unmount between tests on its own.
// The stores outlive a render: start every test from the mock data (spec 004 research R6, spec 006).
afterEach(() => {
  cleanup();
  resetTickets();
  resetCategories();
});
