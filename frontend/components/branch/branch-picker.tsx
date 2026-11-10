"use client";

import { CheckIcon, ChevronsUpDownIcon, LockIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Branch } from "@/lib/types";

interface BranchPickerProps {
  branches: Branch[];
  value: string;
  onChange: (value: string) => void;
  emptyOption?: { value: string; label: string };
  extraOption?: { value: string; label: string };
  onSuggest?: (query: string) => void;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

export function BranchPicker({ branches, value, onChange, emptyOption, extraOption, onSuggest, id, disabled, className, ...aria }: BranchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const specialOptions = [emptyOption, extraOption].filter((option) => option !== undefined);
  const selected = branches.find((branch) => branch.id.toString() === value);
  const triggerLabel = selected
    ? `${selected.name} · ${selected.locationLabel}`
    : (specialOptions.find((option) => option.value === value)?.label ?? "Elige una sucursal");

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const suggest = () => {
    onSuggest?.(query.trim());
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          {...aria}
          className={cn("h-11 w-full justify-between font-normal", !selected && !emptyOption && "text-muted-foreground", className)}
        >
          <span className="truncate">{triggerLabel}</span>
          {disabled ? (
            <LockIcon aria-hidden className="size-4 shrink-0 opacity-50" />
          ) : (
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        <Command>
          <CommandInput placeholder="Busca por nombre o zona" value={query} onValueChange={setQuery} />
          <CommandList className="max-h-72">
            <CommandEmpty>
              <p className="px-2 py-1 text-sm text-muted-foreground">No encontramos esa sucursal.</p>
            </CommandEmpty>
            <CommandGroup>
              {specialOptions.map((option) => (
                <PickerItem key={option.value} value={option.label} selected={value === option.value} onSelect={() => choose(option.value)}>
                  {option.label}
                </PickerItem>
              ))}
              {branches.map((branch) => (
                <PickerItem
                  key={branch.id}
                  value={`${branch.name} ${branch.locationLabel}`}
                  selected={value === branch.id.toString()}
                  onSelect={() => choose(branch.id.toString())}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{branch.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{branch.locationLabel}</span>
                  </span>
                </PickerItem>
              ))}
            </CommandGroup>
            {onSuggest ? (
              <CommandGroup className="border-t">
                <SuggestRow onSelect={suggest} />
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PickerItem({
  value,
  selected,
  onSelect,
  children,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect} className="min-h-11">
      {children}
      <CheckIcon className={cn("ml-auto size-4 shrink-0", selected ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );
}

function SuggestRow({ onSelect }: { onSelect: () => void }) {
  return (
    <CommandItem value="__suggest__" forceMount onSelect={onSelect} className="min-h-11 text-primary">
      <PlusIcon className="size-4" />
      ¿No está tu sucursal? Sugerirla
    </CommandItem>
  );
}
