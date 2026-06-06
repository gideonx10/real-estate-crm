import { Edit3, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getInitials } from "@/lib/utils";

export function BuilderCard({ builder, onDelete }) {
  return (
    <Card>
      <div className="grid grid-cols-[52px_1fr] gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: builder.brand_color || "#0D1B3E" }}
        >
          {getInitials(builder.company_name || builder.full_name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-bold text-navy">{builder.full_name}</h2>
          <p className="text-sm font-semibold text-zinc-600">{builder.company_name || "Independent builder"}</p>
          {builder.brand_tagline ? (
            <p className="mt-1 text-sm italic" style={{ color: builder.brand_color || "#C9A84C" }}>
              {builder.brand_tagline}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-zinc-500">{builder.phone}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link className="text-sm font-bold text-gold" href={`/contacts/builders/${builder.id}`}>
          View Brand Page →
        </Link>
        <div className="flex gap-2">
          <Button aria-label="Call builder" size="icon" variant="secondary" href={`tel:${builder.phone}`}>
            <Phone className="text-success" size={17} />
          </Button>
          <Button aria-label="Edit builder" size="icon" variant="secondary">
            <Edit3 className="text-zinc-500" size={17} />
          </Button>
          <Button aria-label="Delete builder" size="icon" variant="danger" onClick={() => onDelete?.(builder.id)}>
            <Trash2 size={17} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
