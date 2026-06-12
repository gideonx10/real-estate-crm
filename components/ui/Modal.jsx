"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 sm:place-items-center">
      <div className="flex w-full max-w-lg max-h-[85vh] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <Button aria-label="Close modal" size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
