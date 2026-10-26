"use client";

import { dayLabel, nextDateKeys } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DateStripProps {
  value: string;
  onChange: (dateKey: string) => void;
}

export function DateStrip({ value, onChange }: DateStripProps) {
  const days = nextDateKeys(7);

  return (
    <div role="group" aria-label="Fecha" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {days.map((day) => {
        const selected = day === value;
        return (
          <button
            key={day}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(day)}
            className={cn(
              "flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors",
              selected
                ? "border-brand-teal bg-brand-teal text-brand-ivory dark:border-brand-lime dark:bg-brand-lime dark:text-brand-teal"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {dayLabel(day)}
            <span className="text-xs font-normal opacity-70">{day.slice(8)}</span>
          </button>
        );
      })}
    </div>
  );
}
