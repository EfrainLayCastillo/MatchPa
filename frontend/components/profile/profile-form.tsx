"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryField } from "@/components/matchpa/category-field";
import { CategoryTierPicker } from "@/components/matchpa/category-tier-picker";
import { FormAlert } from "@/components/matchpa/form-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { invalidProps, toFormErrors, useFormErrors } from "@/lib/form-errors";
import { GENDER_LABELS } from "@/lib/format";
import { WHITE_FIELDS } from "@/lib/field-styles";
import { useSession } from "@/lib/session";
import type { Category, CategoryTier, Gender } from "@/lib/types";

export function ProfileForm() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [category, setCategory] = useState<Category>(user?.category ?? 4);
  const [categoryTier, setCategoryTier] = useState<CategoryTier | null>(user?.categoryTier ?? null);
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const { errors, formRef, fail, reset, clearField } = useFormErrors();
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const fields = validate(gender);
    if (!gender || Object.keys(fields).length > 0) return fail({ fields, form: null });
    setBusy(true);
    reset();
    try {
      setUser(await api.updateMe({ category, categoryTier, gender }));
      toast.success("Perfil guardado");
      router.push("/lobby");
    } catch (err) {
      fail(toFormErrors(err, "No se pudo guardar tu perfil"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={save} noValidate className={`space-y-6 ${WHITE_FIELDS}`}>
      <CategoryField value={category} onChange={setCategory} hint="Cámbiala cuando subas de nivel." />

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

      <FormAlert message={errors.form} />

      <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
        Guardar cambios
      </Button>
    </form>
  );
}

function validate(gender: Gender | null): Record<string, string> {
  return gender ? {} : { gender: "Elige tu género" };
}
