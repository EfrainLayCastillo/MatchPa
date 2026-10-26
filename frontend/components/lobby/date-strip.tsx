"use client";

import { formatDay, nextDayKeys, todayKey } from "@/lib/panamaFormatDate";
import { cn } from "@/lib/utils";

interface DateStripProps {
  value: string | null;
  onChange: (dateKey: string | null) => void;
}

export function DateStrip({ value, onChange }: DateStripProps) {
  const days = nextDayKeys(7);

  return (
    <div role="group" aria-label="Fecha" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      <DayChip label="Todos" sub="próximos" selected={value === null} onClick={() => onChange(null)} />
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
            {day === todayKey() ? `Hoy ${day.slice(8)}` : formatDay(day)}
          </button>
        );
      })}
    </div>
  );
}

function DayChip({ label, sub, selected, onClick }: { label: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors",
        selected
          ? "border-brand-teal bg-brand-teal text-brand-ivory dark:border-brand-lime dark:bg-brand-lime dark:text-brand-teal"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      {label}
      <span className="text-xs font-normal opacity-70">{sub}</span>
    </button>
  );
}
