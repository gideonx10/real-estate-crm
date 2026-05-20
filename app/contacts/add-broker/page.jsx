"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";
import { getInitials } from "@/lib/utils";

export default function AddBrokerPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createCRMRecord("brokers", {
      full_name: form.get("full_name"),
      agency_firm: form.get("agency_firm"),
      phone: form.get("phone"),
      email: form.get("email"),
      commission_rate: Number(form.get("commission_rate") || 0),
      notes: form.get("notes"),
    });
    router.refresh();
    router.push("/contacts");
  }

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/contacts" variant="secondary" size="icon" aria-label="Back to contacts">
          <ArrowLeft size={19} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Add Broker</h1>
          <p className="text-sm font-semibold text-zinc-500">Broker profile and commission details</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Card className="grid gap-4">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-navy text-xl font-bold text-white">
            {getInitials(name)}
          </div>
          <Input label="Full Name*" name="full_name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Broker name" />
          <Input label="Agency / Firm" name="agency_firm" placeholder="Agency name" />
          <Input label="Phone Number*" name="phone" required inputMode="tel" placeholder="+91 98765 43210" />
          <Input label="Email" name="email" type="email" placeholder="broker@example.com" />
          <Input label="Commission Rate (%)" name="commission_rate" type="number" min="0" step="0.01" placeholder="2" />
          <Textarea label="Notes" name="notes" />
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <Check size={18} /> Add Broker
        </Button>
      </form>
    </div>
  );
}
