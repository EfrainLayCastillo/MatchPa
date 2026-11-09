"use client";

import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { invalidProps } from "@/lib/form-errors";
import type { CategoryTier } from "@/lib/types";

const NONE = "none";

const OPTIONS = [
  { value: "entry", label: "De entrada" },
  { value: NONE, label: "Sin precisar" },
  { value: "high", label: "Alta" },
] as const;

interface CategoryTierPickerProps {
  id: string;
  value: CategoryTier | null;
  onChange: (value: CategoryTier | null) => void;
  error?: string;
  description?: string;
}

export function CategoryTierPicker({ id, value, onChange, error, description }: CategoryTierPickerProps) {
  const labelId = `${id}-label`;
  return (
    <div className="space-y-1.5">
      <Label id={labelId}>Subnivel (opcional)</Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <RadioGroup
        aria-labelledby={labelId}
        value={value ?? NONE}
        onValueChange={(next) => onChange(next === NONE ? null : (next as CategoryTier))}
        className="grid grid-cols-3 gap-2"
      >
        {OPTIONS.map((option) => (
          <Label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2.5 text-center text-sm leading-tight font-medium has-aria-invalid:border-destructive has-aria-invalid:bg-destructive/5 has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
          >
            <RadioGroupItem value={option.value} {...invalidProps(id, error)} />
            {option.label}
          </Label>
        ))}
      </RadioGroup>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
