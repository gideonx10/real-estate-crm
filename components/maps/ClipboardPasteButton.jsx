"use client";

import { ClipboardPaste } from "lucide-react";

export function ClipboardPasteButton({ onPaste, className = "" }) {
  async function handleClick() {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) onPaste(text.trim());
    } catch {
      // Clipboard access denied or unavailable — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Paste a Google Maps link from clipboard"
      aria-label="Paste from clipboard"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50 active:scale-95 ${className}`}
    >
      <ClipboardPaste size={16} className="text-navy/70" />
    </button>
  );
}
