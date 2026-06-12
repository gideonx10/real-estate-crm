"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({ open, title = "Confirm Delete", message, onConfirm, onCancel, confirming = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm animate-[scaleIn_0.15s_ease-out] rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-center text-lg font-bold text-zinc-950">{title}</h3>
        <p className="mt-2 text-center text-sm font-medium leading-relaxed text-zinc-600">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={confirming}>
            No
          </Button>
          <Button type="button" variant="danger" size="lg" className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Deleting..." : "Yes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
