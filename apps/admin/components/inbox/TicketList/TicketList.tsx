import type { Feedback } from "@/lib/types";
import { TicketRow } from "../TicketRow/TicketRow";

type TicketListProps = {
  tickets: Feedback[];
  selectedId: string | null;
  now: number | null;
  onSelect: (id: string) => void;
};

export function TicketList({ tickets, selectedId, now, onSelect }: TicketListProps) {
  return (
    <div className="inbox__scroll overflow-y-auto">
      {tickets.length === 0 ? (
        <p className="inbox__empty">Ingen feedback matcher filtrene.</p>
      ) : (
        <ul aria-label="Feedback">
          {tickets.map((ticket) => (
            <li key={ticket._id}>
              <TicketRow
                ticket={ticket}
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
