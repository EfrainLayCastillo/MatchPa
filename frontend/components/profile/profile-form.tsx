"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryTierPicker } from "@/components/matchpa/category-tier-picker";
import { FormAlert } from "@/components/matchpa/form-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api";
import { invalidProps, toFormErrors, useFormErrors } from "@/lib/form-errors";
import { CATEGORIES, GENDER_LABELS, shortCategory } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Category, CategoryTier, Gender } from "@/lib/types";

interface ProfileFormProps {
  mode: "onboarding" | "profile";
}

export function ProfileForm({ mode }: ProfileFormProps) {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [category, setCategory] = useState<Category>(user?.category ?? 4);
  const [categoryTier, setCategoryTier] = useState<CategoryTier | null>(user?.categoryTier ?? null);
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const { errors, formRef, fail, reset, clearField } = useFormErrors();
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const fields = validate(gender, phone);
    if (!gender || Object.keys(fields).length > 0) return fail({ fields, form: null });
    setBusy(true);
    reset();
    try {
      setUser(await api.updateMe({ category, categoryTier, gender, phone: phone.trim() }));
      if (mode === "onboarding") {
        track("sign_up", { category });
        router.replace("/lobby");
      }
      else toast.success("Perfil guardado");
    } catch (err) {
      fail(toFormErrors(err, "No se pudo guardar tu perfil"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={save} noValidate className="space-y-6">
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
        <Label id="gender-label">Género</Label>
        <RadioGroup aria-labelledby="gender-label" value={gender ?? ""} onValueChange={(value) => { setGender(value as Gender); clearField("gender"); }} className="grid grid-cols-2 gap-2">
          {(Object.keys(GENDER_LABELS) as Gender[]).map((value) => (
            <Label
              key={value}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-aria-invalid:border-destructive has-aria-invalid:bg-destructive/5 has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
            >
              <RadioGroupItem value={value} {...invalidProps("gender", errors.fields.gender)} />
              {GENDER_LABELS[value]}
            </Label>
          ))}
        </RadioGroup>
        <FieldError id="gender-error">{errors.fields.gender}</FieldError>
      </div>

      <CategoryTierPicker
        id="categoryTier"
        description="¿En qué parte de tu categoría juegas?"
        value={categoryTier}
        onChange={(value) => {
          setCategoryTier(value);
          clearField("categoryTier");
        }}
        error={errors.fields.categoryTier}
      />

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+507 6000-0000" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s()-]/g, "")); clearField("phone"); }} maxLength={25} required {...invalidProps("phone", errors.fields.phone)} />
        <FieldError id="phone-error">{errors.fields.phone}</FieldError>
        <p className="text-xs text-muted-foreground">Se guarda cifrado. Solo lo usamos para que el organizador de un partido en el que juegas pueda escribirte por WhatsApp.</p>
      </div>

      <FormAlert message={errors.form} />

      <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
        {mode === "onboarding" ? "Entrar al lobby" : "Guardar cambios"}
      </Button>
    </form>
  );
}

function validate(gender: Gender | null, phone: string): Record<string, string> {
  const digits = phone.replace(/\D/g, "");
  return {
    ...(gender ? {} : { gender: "Elige tu género" }),
    ...(digits.length >= 7 && digits.length <= 15 ? {} : { phone: "Escribe un número de WhatsApp válido" }),
  };
}
