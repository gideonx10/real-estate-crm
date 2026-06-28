"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  title = "Confirm Delete",
  message,
  onConfirm,
  onCancel,
  confirming = false,
  confirmLabel = "Yes",
  confirmingLabel = "Deleting...",
  confirmVariant = "danger",
}) {
  if (!open) return null;
  const isDanger = confirmVariant === "danger";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm animate-[scaleIn_0.15s_ease-out] rounded-2xl bg-white p-5 shadow-2xl">
        <div
          className={cn(
            "mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full",
            isDanger ? "bg-red-50 text-red-600" : "bg-navy/10 text-navy"
          )}
        >
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-center text-lg font-bold text-zinc-950">{title}</h3>
        <p className="mt-2 text-center text-sm font-medium leading-relaxed text-zinc-600">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={confirming}>
            No
          </Button>
          <Button
            type="button"
            variant={isDanger ? "danger" : "primary"}
            size="lg"
            className={isDanger ? "bg-red-600 text-white hover:bg-red-700" : undefined}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
