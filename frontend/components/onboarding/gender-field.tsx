"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GENDER_LABELS } from "@/lib/format";
import type { Gender } from "@/lib/types";

const GENDERS = Object.keys(GENDER_LABELS) as Gender[];

interface GenderFieldProps {
  value: Gender | null;
  onPick: (gender: Gender) => void;
  labelledBy: string;
}

export function GenderField({ value, onPick, labelledBy }: GenderFieldProps) {
  return (
    <RadioGroup aria-labelledby={labelledBy} value={value ?? ""} onValueChange={(next) => onPick(next as Gender)} className="grid grid-cols-2 gap-2">
      {GENDERS.map((gender) => (
        <Label
          key={gender}
          onClick={() => onPick(gender)}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
        >
          <RadioGroupItem value={gender} />
          {GENDER_LABELS[gender]}
        </Label>
      ))}
    </RadioGroup>
  );
}
