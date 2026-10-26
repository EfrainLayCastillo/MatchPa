"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, GENDER_LABELS, shortCategory } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Category, Gender } from "@/lib/types";

interface ProfileFormProps {
  mode: "onboarding" | "profile";
}

export function ProfileForm({ mode }: ProfileFormProps) {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [category, setCategory] = useState<Category>(user?.category ?? 4);
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!gender) return setError("Elige tu género");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) return setError("Escribe un número de WhatsApp válido");
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      setUser(await api.updateMe({ category, gender, phone: phone.trim() }));
      if (mode === "onboarding") router.replace("/lobby");
      else setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar tu perfil");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select value={category.toString()} onValueChange={(value) => setCategory(Number(value) as Category)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {shortCategory(value)} categoría
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Cámbiala cuando subas de nivel.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Género</Label>
        <RadioGroup value={gender ?? ""} onValueChange={(value) => setGender(value as Gender)} className="grid grid-cols-2 gap-2">
          {(Object.keys(GENDER_LABELS) as Gender[]).map((value) => (
            <Label
              key={value}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
            >
              <RadioGroupItem value={value} />
              {GENDER_LABELS[value]}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+507 6000-0000" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ""))} maxLength={25} required />
        <p className="text-xs text-muted-foreground">Se guarda cifrado. Solo lo usamos para que el organizador de un partido en el que juegas pueda escribirte por WhatsApp.</p>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p role="status" className="text-sm font-medium text-brand-teal dark:text-brand-lime">Perfil guardado</p> : null}

      <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
        {mode === "onboarding" ? "Entrar al lobby" : "Guardar cambios"}
      </Button>
    </form>
  );
}
