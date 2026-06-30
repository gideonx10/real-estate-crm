"use client";

import { useMemo, useRef, useState } from "react";
import { Building2, FolderKanban, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectSearchBar({ projects, builders, query, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);

  const { projectMatches, builderMatches, locationMatches, allItems } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) {
      return { projectMatches: [], builderMatches: [], locationMatches: [], allItems: [] };
    }
    const pm = projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ type: "project", label: p.name, sub: p.location }));

    const bm = builders
      .filter((b) => (b.company_name || b.full_name || "").toLowerCase().includes(q))
      .slice(0, 3)
      .map((b) => ({ type: "builder", label: b.company_name || b.full_name }));

    const uniqueLocs = [...new Set(projects.map((p) => p.location).filter(Boolean))];
    const lm = uniqueLocs
      .filter((l) => l.toLowerCase().includes(q))
      .slice(0, 3)
      .map((l) => ({ type: "location", label: l }));

    return {
      projectMatches: pm,
      builderMatches: bm,
      locationMatches: lm,
      allItems: [...pm, ...bm, ...lm],
    };
  }, [query, projects, builders]);

  function selectItem(item) {
    onChange(item.label);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.blur();
  }

  function handleKeyDown(e) {
    if (!open || !allItems.length) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectItem(allItems[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  function handleChange(e) {
    onChange(e.target.value);
    setActiveIdx(-1);
    setOpen(e.target.value.trim().length >= 1);
  }

  function handleClear() {
    onChange("");
    setOpen(false);
    inputRef.current?.focus();
  }

  const hasResults = allItems.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim().length >= 1 && hasResults && setOpen(true)}
          onBlur={() =>
            setTimeout(() => {
              setOpen(false);
              setActiveIdx(-1);
            }, 150)
          }
          onKeyDown={handleKeyDown}
          placeholder="Search by project, builder, or location…"
          aria-label="Search projects"
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-10 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {open && hasResults ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <SuggestionGroup
            label="Projects"
            icon={FolderKanban}
            items={projectMatches}
            activeIdx={activeIdx}
            baseIdx={0}
            onSelect={selectItem}
          />
          <SuggestionGroup
            label="Builders"
            icon={Building2}
            items={builderMatches}
            activeIdx={activeIdx}
            baseIdx={projectMatches.length}
            onSelect={selectItem}
          />
          <SuggestionGroup
            label="Locations"
            icon={MapPin}
            items={locationMatches}
            activeIdx={activeIdx}
            baseIdx={projectMatches.length + builderMatches.length}
            onSelect={selectItem}
          />
        </div>
      ) : null}
    </div>
  );
}

function SuggestionGroup({ label, icon: Icon, items, activeIdx, baseIdx, onSelect }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
        <Icon size={11} />
        {label}
      </div>
      {items.map((item, i) => {
        const idx = baseIdx + i;
        const isActive = activeIdx === idx;
        return (
          <button
            key={`${item.type}-${item.label}`}
            type="button"
            onMouseDown={() => onSelect(item)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition",
              isActive ? "bg-navy/5" : "hover:bg-zinc-50"
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-900">{item.label}</p>
              {item.sub ? (
                <p className="truncate text-xs text-zinc-500">{item.sub}</p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
