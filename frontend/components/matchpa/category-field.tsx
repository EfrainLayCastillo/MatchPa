"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, shortCategory } from "@/lib/format";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryFieldProps {
  value: Category;
  onChange: (value: Category) => void;
  hint?: string;
  triggerClassName?: string;
}

export function CategoryField({ value, onChange, hint, triggerClassName }: CategoryFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>Categoría</Label>
      <Select value={value.toString()} onValueChange={(next) => onChange(Number(next) as Category)}>
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {shortCategory(option)} categoría
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
