"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatLongDate } from "@/lib/panamaFormatDate";

interface DateFieldProps {
  id?: string;
  /** "YYYY-MM-DD" */
  value: string;
  /** "YYYY-MM-DD"; earlier days can't be picked. */
  min: string;
  onChange: (value: string) => void;
}

/** Date picker that stores "YYYY-MM-DD" and never shifts the day across time zones. */
export function DateField({ id, value, min, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = fromKey(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon className="mr-2 size-4 opacity-70" aria-hidden />
          {formatLongDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={{ before: fromKey(min) }}
          onSelect={(date) => {
            if (!date) return;
            onChange(toKey(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Builds a local date from the key, so the day is the same everywhere. */
function fromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
