import type { KeyboardEvent } from "react";
import { Icon } from "@/components/Icons/Icon";

type SearchBarProps = {
  /** The search text as typed. */
  value: string;
  onChange: (value: string) => void;
};

/** The bar above the inbox (Figma 323:1707). There is no form, so Enter submits nothing. */
export function SearchBar({ value, onChange }: SearchBarProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Firefox does not clear search fields on Escape; Chrome and Safari do (research R5).
    if (event.key === "Escape" && value !== "") {
      event.preventDefault();
      onChange("");
    }
  }

  return (
    <div className="search-bar" role="search">
      <label className="search-field">
        <Icon name="search" className="search-field__icon" />
        <input
          type="search"
          className="search-input"
          aria-label="Søg i feedback"
          placeholder="Søg i feedback, brugere, sider…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
    </div>
  );
}
