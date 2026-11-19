"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CategoryField } from "@/components/matchpa/category-field";
import { CategoryTierPicker } from "@/components/matchpa/category-tier-picker";
import { FormAlert } from "@/components/matchpa/form-alert";
import { VOLLEY_HIT } from "@/components/matchpa/court-state/motion";
import { ServeFigure } from "@/components/matchpa/court-state/serve-figure";
import { useStillness } from "@/components/iso/live";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api";
import { toFormErrors, useFormErrors } from "@/lib/form-errors";
import { WHITE_FIELDS } from "@/lib/field-styles";
import { useSession } from "@/lib/session";
import type { Category, CategoryTier, Gender } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GenderField } from "./gender-field";
import { WaitingStands } from "./waiting-stands";

const STEPS = 2;
const SERVE_ADVANCE_MS = Math.round((VOLLEY_HIT + 0.65) * 1000);
const STILL_ADVANCE_MS = 250;
const GENDER_LABEL_ID = "onboarding-gender-label";

export function OnboardingFlow() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [category, setCategory] = useState<Category>(user?.category ?? 4);
  const [categoryTier, setCategoryTier] = useState<CategoryTier | null>(user?.categoryTier ?? null);
  const [serves, setServes] = useState(0);
  const [busy, setBusy] = useState(false);
  const { errors, formRef, fail, reset, clearField } = useFormErrors();
  const still = useStillness();
  const advance = useRef<ReturnType<typeof setTimeout>>(undefined);
  const titles = useRef<(HTMLHeadingElement | null)[]>([]);
  const moved = useRef(false);

  useEffect(() => () => clearTimeout(advance.current), []);

  useEffect(() => {
    if (moved.current) titles.current[step]?.focus({ preventScroll: true });
    moved.current = true;
  }, [step]);

  function pick(value: Gender) {
    clearTimeout(advance.current);
    setGender(value);
    setServes((count) => count + 1);
    advance.current = setTimeout(() => setStep(1), still ? STILL_ADVANCE_MS : SERVE_ADVANCE_MS);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!gender) return setStep(0);
    setBusy(true);
    reset();
    try {
      setUser(await api.updateMe({ category, categoryTier, gender }));
      track("onboarding_complete", { category });
      router.replace("/lobby");
    } catch (err) {
      const failure = toFormErrors(err, "No se pudo guardar tu perfil");
      fail(failure.fields.gender ? { fields: {}, form: failure.fields.gender } : failure);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-20 overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
        <ProgressBar step={step} onBack={() => setStep(0)} />
        <div className="flex flex-1 overflow-hidden">
          <div
            className="flex w-full shrink-0 transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            <Slide active={step === 0} title="Cuéntanos de ti" hint="Elige y prepárate, que ya te llega la pelota." heading={(node) => (titles.current[0] = node)}>
              <Stage>
                <ServeFigure move="volley" serves={serves} label="Tu jugador en una cancha de pádel con vidrios y red, botando la pelota. Al elegir, le llega una pelota y la voleará." />
              </Stage>
              <ProgressDots step={0} />
              <div className="space-y-2 pt-2">
                <p id={GENDER_LABEL_ID} className="text-sm font-semibold">Género</p>
                <GenderField value={gender} onPick={pick} labelledBy={GENDER_LABEL_ID} />
              </div>
            </Slide>
            <Slide active={step === 1} title="La grada ya te espera" hint="Dinos tu nivel y te guardamos la butaca." heading={(node) => (titles.current[1] = node)}>
              <Stage>
                <WaitingStands category={category} categoryTier={categoryTier} />
              </Stage>
              <ProgressDots step={1} />
              <form ref={formRef} onSubmit={save} noValidate className={cn("space-y-4 pt-2", WHITE_FIELDS)}>
                <CategoryField value={category} onChange={setCategory} triggerClassName="h-11" />
                <CategoryTierPicker
                  id="categoryTier"
                  value={categoryTier}
                  onChange={(value) => {
                    setCategoryTier(value);
                    clearField("categoryTier");
                  }}
                  error={errors.fields.categoryTier}
                />
                <FormAlert message={errors.form} />
                <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
                  Entrar al lobby
                </Button>
              </form>
            </Slide>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <div className="px-2 pt-2">
      {step > 0 ? (
        <Button type="button" variant="ghost" size="icon" className="size-11" onClick={onBack} aria-label="Volver al paso anterior">
          <ChevronLeftIcon className="size-6" />
        </Button>
      ) : (
        <span className="size-11" />
      )}
    </div>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-2 py-2" role="img" aria-label={`Paso ${step + 1} de ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, index) => (
          <span
            key={index}
            className={cn("h-2 rounded-full transition-all duration-300 motion-reduce:transition-none", index === step ? "w-6 bg-brand-teal dark:bg-brand-lime" : "w-2 bg-brand-teal/20 dark:bg-brand-ivory/25")}
          />
        ))}
    </div>
  );
}

interface SlideProps {
  active: boolean;
  title: string;
  hint: string;
  heading: (node: HTMLHeadingElement | null) => void;
  children: React.ReactNode;
}

function Slide({ active, title, hint, heading, children }: SlideProps) {
  return (
    <section inert={!active} aria-hidden={!active} className="flex w-full shrink-0 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      <div className="space-y-1">
        <h1 ref={heading} tabIndex={-1} className="font-heading text-3xl font-extrabold leading-tight outline-none">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center py-2">
      <div className="court-state w-[min(100%,36dvh)] min-w-44 rounded-2xl">{children}</div>
    </div>
  );
}
