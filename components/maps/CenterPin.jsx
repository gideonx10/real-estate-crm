"use client";

export function CenterPin({ isDragging }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div
        className={`relative transition-all duration-200 ease-out ${
          isDragging ? "-translate-y-4 scale-110" : "translate-y-0 scale-100"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full border-[3px] border-white bg-navy transition-shadow duration-200 ${
            isDragging ? "shadow-2xl" : "shadow-md"
          }`}
        />
        <div className="mx-auto h-3 w-0.5 bg-navy" />
        <div
          className={`mx-auto rounded-full bg-navy/30 blur-sm transition-all duration-200 ${
            isDragging ? "h-1 w-8" : "h-1.5 w-3"
          }`}
        />
      </div>
    </div>
  );
}
