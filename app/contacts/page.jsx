"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { BuilderCard } from "@/components/contacts/BuilderCard";
import { BrokerCard } from "@/components/contacts/BrokerCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { deleteCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn } from "@/lib/utils";

export default function ContactsPage() {
  const data = useCRMData();
  const [tab, setTab] = useState("Builders");
  const [query, setQuery] = useState("");

  const builders = useMemo(() => {
    if (!data) return [];
    return data.builders.filter((builder) =>
      `${builder.full_name} ${builder.company_name} ${builder.phone}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const brokers = useMemo(() => {
    if (!data) return [];
    return data.brokers.filter((broker) =>
      `${broker.full_name} ${broker.agency_firm} ${broker.phone}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  if (!data) return null;

  return (
    <div className="grid gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Contacts</h1>
        <Button href={tab === "Builders" ? "/contacts/add-builder" : "/contacts/add-broker"} size="icon" aria-label="Add contact">
          <Plus size={21} />
        </Button>
      </header>

      <Input
        aria-label="Search contacts"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={tab === "Builders" ? "Search builders..." : "Search brokers..."}
      />

      <div className="grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
        {[
          ["Builders", data.builders.length],
          ["Brokers", data.brokers.length],
        ].map(([item, count]) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-bold transition",
              tab === item ? "bg-navy text-white" : "text-zinc-500"
            )}
          >
            {item} ({count})
          </button>
        ))}
      </div>

      <section className="grid gap-3 lg:grid-cols-2">
        {tab === "Builders"
          ? builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} onDelete={(id) => deleteCRMRecord("builders", id)} />
            ))
          : brokers.map((broker) => (
              <BrokerCard key={broker.id} broker={broker} onDelete={(id) => deleteCRMRecord("brokers", id)} />
            ))}
      </section>
    </div>
  );
}
