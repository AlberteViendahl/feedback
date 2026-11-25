import { getCategory } from "@/lib/categories/state";
import type { Category, Feedback } from "@/lib/types";
import { TicketRow } from "../TicketRow/TicketRow";

type TicketListProps = {
  tickets: Feedback[];
  categories: Category[];
  selectedId: string | null;
  now: number | null;
  /** Picks the empty-state text: the search found nothing, or the filters did. */
  isSearching: boolean;
  onSelect: (id: string) => void;
};

export function TicketList({ tickets, categories, selectedId, now, isSearching, onSelect }: TicketListProps) {
  return (
    <div className="inbox__scroll overflow-y-auto">
      {tickets.length === 0 ? (
        <p className="inbox__empty">
          {isSearching ? "Ingen feedback matcher søgningen." : "Ingen feedback matcher filtrene."}
        </p>
      ) : (
        <ul aria-label="Feedback">
          {tickets.map((ticket) => (
            <li key={ticket._id}>
              <TicketRow
                ticket={ticket}
                category={getCategory(categories, ticket.category)}
                isSelected={ticket._id === selectedId}
                now={now}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
