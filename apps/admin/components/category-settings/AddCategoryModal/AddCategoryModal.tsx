"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Icon } from "@/components/Icons/Icon";
import { CATEGORY_COLOR_LABELS, CATEGORY_ICONS } from "@/components/Icons/category-icons";
import { validateCategoryName } from "@/lib/categories/state";
import type { Category, CategoryColor, CategoryIcon } from "@/lib/types";

type AddCategoryModalProps = {
  /** For the duplicate check (FR-010). */
  categories: Category[];
  onAdd: (input: { name: string; icon: CategoryIcon; color: CategoryColor }) => void;
  /** Annuller, ×, Escape or a click outside. */
  onClose: () => void;
};

const ICONS = Object.keys(CATEGORY_ICONS) as CategoryIcon[];
const COLORS = Object.keys(CATEGORY_COLOR_LABELS) as CategoryColor[];

/**
 * The "Tilføj ny kategori" dialog (spec 006, Figma 415:533). A native <dialog> opened with
 * showModal(), so the browser traps focus, makes the page behind inert and closes on Escape
 * (research R8). Mounted only while open, so each opening starts empty.
 */
export function AddCategoryModal({ categories, onAdd, onClose }: AddCategoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<CategoryIcon | null>(null);
  const [color, setColor] = useState<CategoryColor | null>(null);
  const [showDuplicate, setShowDuplicate] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const canAdd = validateCategoryName(name, categories) !== "empty" && icon !== null && color !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAdd || icon === null || color === null) return;
    if (validateCategoryName(name, categories) === "duplicate") {
      setShowDuplicate(true);
      return;
    }
    onAdd({ name: name.trim(), icon, color });
  }

  const describedBy = showDuplicate ? `${id}-hint ${id}-error` : `${id}-hint`;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        // Escape: let React unmount the dialog instead of the browser closing it.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop around the content.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal__body">
          <div className="modal__header">
            <h2 id={`${id}-title`} className="modal__title">
              Tilføj ny kategori
            </h2>
            <button type="button" className="icon-button" aria-label="Luk" onClick={onClose}>
              <Icon name="close" />
            </button>
          </div>
          <p className="modal__description">Giv AI&apos;en en ny måde at sortere feedback på.</p>

          <label htmlFor={`${id}-name`} className="modal__label">
            Kategorinavn
          </label>
          <input
            id={`${id}-name`}
            className="text-input"
            value={name}
            maxLength={40}
            placeholder="f.eks. Forbedring"
            autoFocus
            aria-invalid={showDuplicate || undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              setName(event.target.value);
              setShowDuplicate(false);
            }}
          />
          <p id={`${id}-hint`} className="modal__hint">
            AI&apos;en kan vælge kategorien, når den sorterer feedback.
          </p>
          {showDuplicate && (
            <p id={`${id}-error`} className="modal__error" role="alert">
              Der findes allerede en kategori med det navn.
            </p>
          )}

          <fieldset className="modal__fieldset">
            <legend className="modal__legend">
              Kategori-ikon
              <span className="modal__legend-hint">Vælg én</span>
            </legend>
            <div className="icon-choices">
              {ICONS.map((option) => {
                const { Icon: OptionIcon, label } = CATEGORY_ICONS[option];
                return (
                  <label key={option} className="icon-choice">
                    <input
                      type="radio"
                      name={`${id}-icon`}
                      className="sr-only"
                      checked={icon === option}
                      onChange={() => setIcon(option)}
                    />
                    <OptionIcon />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="modal__fieldset">
            <legend className="modal__legend">Kategorifarve</legend>
            <div className="color-choices">
              {COLORS.map((option) => (
                <label
                  key={option}
                  className="color-choice"
                  style={{ "--swatch": `var(--category-${option})` } as CSSProperties}
                >
                  <input
                    type="radio"
                    name={`${id}-color`}
                    className="sr-only"
                    checked={color === option}
                    onChange={() => setColor(option)}
                  />
                  <span className="sr-only">{CATEGORY_COLOR_LABELS[option]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="modal__footer">
          <button type="button" className="button" onClick={onClose}>
            Annuller
          </button>
          <button type="submit" className="button button--primary" disabled={!canAdd}>
            Tilføj kategori
          </button>
        </div>
      </form>
    </dialog>
  );
}
