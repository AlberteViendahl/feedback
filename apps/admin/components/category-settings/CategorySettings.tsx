"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { addCategory, toggleCategory, useCategoriesStore } from "@/lib/categories/store";
import { AddCategoryModal } from "./AddCategoryModal/AddCategoryModal";
import { CategoryRow } from "./CategoryRow/CategoryRow";

/** The Categories card on the settings page: list, on/off switches and the add dialog (spec 006). */
export function CategorySettings() {
  const categories = useCategoriesStore((state) => state.categories);
  const [isAdding, setIsAdding] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const titleId = useId();

  // With Cache Components, Next.js hides this page with <Activity> instead of unmounting it.
  // Close the dialog as it is hidden, so it is not open on return (research R12).
  useLayoutEffect(() => () => setIsAdding(false), []);

  // Focus goes back to the button once the dialog is gone; while it is open the page is inert
  // (FR-011).
  useEffect(() => {
    if (isAdding || !restoreFocus.current) return;
    restoreFocus.current = false;
    addButtonRef.current?.focus();
  }, [isAdding]);

  function close() {
    restoreFocus.current = true;
    setIsAdding(false);
  }

  return (
    <section className="settings-card" aria-labelledby={titleId}>
      <div className="settings-card__header">
        <div>
          <h2 id={titleId} className="settings-card__title">
            Kategorier
          </h2>
          <p className="settings-card__subtitle">Det AI&apos;en kan sortere feedback i</p>
        </div>
        <button
          ref={addButtonRef}
          type="button"
          className="button button--soft"
          onClick={() => setIsAdding(true)}
        >
          <span className="button--soft__plus" aria-hidden="true">
            +
          </span>
          Tilføj ny kategori
        </button>
      </div>

      <ul>
        {categories.map((category) => (
          <CategoryRow key={category._id} category={category} onToggle={toggleCategory} />
        ))}
      </ul>

      {isAdding && (
        <AddCategoryModal
          categories={categories}
          onAdd={(input) => {
            addCategory(input);
            close();
          }}
          onClose={close}
        />
      )}
    </section>
  );
}
