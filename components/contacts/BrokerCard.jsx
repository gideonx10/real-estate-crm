import { Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getInitials } from "@/lib/utils";

export function BrokerCard({ broker, onDelete }) {
  return (
    <Card>
      <div className="grid grid-cols-[52px_1fr_auto] gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-sm font-bold text-white">
          {getInitials(broker.full_name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-bold text-navy">{broker.full_name}</h2>
          <p className="text-sm font-semibold text-zinc-600">{broker.agency_firm || "Independent broker"}</p>
          <p className="mt-2 text-sm text-zinc-500">{broker.phone}</p>
          <p className="text-sm font-semibold text-gold">{broker.commission_rate || 0}% commission</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button aria-label="Call broker" size="icon" variant="secondary" href={`tel:${broker.phone}`}>
            <Phone className="text-success" size={17} />
          </Button>
          <Button aria-label="Delete broker" size="icon" variant="danger" onClick={() => onDelete?.(broker.id)}>
            <Trash2 size={17} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
