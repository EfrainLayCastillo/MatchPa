"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BranchPicker } from "@/components/branch/branch-picker";
import { SuggestBranchDialog } from "@/components/branch/suggest-branch-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/matchpa/date-field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { track } from "@/lib/analytics";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import {
  invalidProps,
  toFormErrors,
  useFormErrors,
  type FieldErrors,
} from "@/lib/form-errors";
import { FormAlert } from "@/components/matchpa/form-alert";
import { FieldError } from "@/components/ui/field";
import { CategoryTierPicker } from "@/components/matchpa/category-tier-picker";
import {
  CATEGORIES,
  GENDER_LABELS,
  shortCategory,
  TYPE_LABELS,
} from "@/lib/format";
import {
  dateKey,
  formatClock,
  formatClock12,
  todayKey,
} from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type {
  Category,
  CategoryTier,
  Branch,
  Gender,
  Match,
  MatchType,
  NewMatchInput,
} from "@/lib/types";

interface GuestDraft {
  name: string;
  category: Category;
  gender: Gender;
}

function MatchFormBody({ match }: { match?: Match }) {
  const { user } = useSession();
  const { handleError } = useVerifiedAction();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteeId = match ? null : Number(searchParams.get("invitar")) || null;
  const inviteeName = searchParams.get("nombre");
  const presetDate = match ? null : searchParams.get("fecha");
  const presetBranch = match ? null : searchParams.get("sucursal");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [date, setDate] = useState(() =>
    match
      ? dateKey(new Date(match.startsAt))
      : validDate(presetDate) ?? todayKey(),
  );
  const [time, setTime] = useState(() =>
    match ? formatClock(match.startsAt) : "18:00",
  );
  const [duration, setDuration] = useState<"90" | "120">(
    match ? (String(match.durationMinutes) as "90" | "120") : "90",
  );
  const [branchId, setBranchId] = useState(
    match ? String(match.branch.id) : (presetBranch ?? ""),
  );
  const [suggestQuery, setSuggestQuery] = useState<string | null>(null);
  const [courtNumber, setCourtNumber] = useState(
    match ? String(match.courtNumber) : "",
  );
  const [category, setCategory] = useState<Category>(
    match?.category ?? user?.category ?? 4,
  );
  const [categoryTier, setCategoryTier] = useState<CategoryTier | null>(
    match?.categoryTier ?? null,
  );
  const [type, setType] = useState<MatchType>(match?.type ?? "mixed");
  const [maxPlayers, setMaxPlayers] = useState(
    match ? String(match.maxPlayers) : "4",
  );
  const [guests, setGuests] = useState<GuestDraft[]>(() =>
    match
      ? match.guests.map(({ name, category, gender }) => ({
          name,
          category,
          gender,
        }))
      : [],
  );
  const { errors, formRef, fail, reset, clearField } = useFormErrors();
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Match | null>(null);
  const [step, setStep] = useState(0);
  // The publish button sits where "Siguiente" was; it stays disabled briefly so a second tap can't publish by accident.
  const [publishReady, setPublishReady] = useState(false);

  const seatsForGuests = Number(maxPlayers) - 1;

  useEffect(() => {
    api
      .branches()
      .then((loaded) => {
        setBranches(loaded);
        setBranchId((current) =>
          loaded.some((branch) => String(branch.id) === current) ? current : "",
        );
      })
      .catch(() => {});
  }, []);

  function updateGuest(index: number, patch: Partial<GuestDraft>) {
    setGuests((current) =>
      current.map((guest, i) => (i === index ? { ...guest, ...patch } : guest)),
    );
  }

  function buildInput(): NewMatchInput {
    return {
      branchId: Number(branchId),
      courtNumber: Number(courtNumber),
      startsAt: new Date(`${date}T${time}:00-05:00`).toISOString(),
      durationMinutes: Number(duration) as 90 | 120,
      category,
      categoryTier,
      type,
      maxPlayers: Number(maxPlayers),
      guests: guests.map((guest) => ({ ...guest, name: guest.name.trim() })),
    };
  }

  function goNext() {
    const fields = whereErrors(branchId, courtNumber);
    if (Object.keys(fields).length > 0) return fail({ fields, form: null });
    reset();
    setStep(1);
    setPublishReady(false);
    window.setTimeout(() => setPublishReady(true), 1000);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step === 0) return goNext();
    // Only the explicit publish button may create the match.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (!submitter?.hasAttribute("data-publish")) return;
    const fields = {
      ...whereErrors(branchId, courtNumber),
      ...guestErrors(guests),
    };
    if (Object.keys(fields).length > 0)
      return showErrors({ fields, form: null });

    setBusy(true);
    reset();
    try {
      if (match) {
        const updated = await api.updateMatch(match.code, buildInput());
        router.push(`/partidos/${updated.code}`);
        return;
      }
      const published = await api.createMatch(buildInput());
      track("publish_match", {
        match_type: published.type,
        category: published.category,
        max_players: published.maxPlayers,
      });
      if (inviteeId)
        await api.invite(published.code, inviteeId).catch(() => null);
      if (shouldAskForPush()) {
        setCreated(published);
        return;
      }
      router.push(`/partidos/${published.code}`);
    } catch (err) {
      if (handleError(err)) return;
      showErrors(toFormErrors(err, "No se pudo publicar el partido"));
    } finally {
      setBusy(false);
    }
  }

  function showErrors(next: { fields: FieldErrors; form: string | null }) {
    if (Object.keys(next.fields).some((name) => STEP_ONE_FIELDS.has(name)))
      setStep(0);
    fail(next);
  }

  if (created) {
    return (
      <div className="space-y-4">
        <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">
          ¡Listo!
        </p>
        <PushPrompt
          open
          onOpenChange={(open) => {
            if (!open) router.push(`/partidos/${created.code}`);
          }}
          reason="Te avisamos cuando alguien pida unirse a tu partido."
        />
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {inviteeId ? (
        <p className="rounded-xl bg-brand-lime/40 p-3 text-sm">
          Al publicar le enviaremos la invitación a{" "}
          <strong>{inviteeName}</strong>.
        </p>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Paso {step + 1} de 2
      </p>

      {step === 0 ? (
        <Section title="Cuándo y dónde">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" htmlFor="date">
              <DateField
                id="date"
                value={date}
                min={todayKey()}
                onChange={setDate}
              />
            </Field>
            <Field label="Hora" htmlFor="time" error={errors.fields.startsAt}>
              <Select
                value={time}
                onValueChange={(value) => {
                  setTime(value);
                  clearField("startsAt");
                }}
              >
                <SelectTrigger
                  id="time"
                  className="w-full"
                  aria-label="Hora"
                  {...invalidProps("time", errors.fields.startsAt)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions(time).map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatClock12(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duración">
              <Select
                value={duration}
                onValueChange={(value) => setDuration(value as "90" | "120")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">1h 30min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Cancha"
              htmlFor="court"
              error={errors.fields.courtNumber}
            >
              <Input
                id="court"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Ej. 3"
                value={courtNumber}
                onChange={(e) => {
                  setCourtNumber(e.target.value);
                  clearField("courtNumber");
                }}
                required
                {...invalidProps("court", errors.fields.courtNumber)}
              />
            </Field>
          </div>
          <Field
            label="Sucursal"
            htmlFor="branch"
            error={errors.fields.branchId}
          >
            <BranchPicker
              id="branch"
              branches={branches}
              value={branchId}
              onChange={(value) => {
                setBranchId(value);
                clearField("branchId");
              }}
              onSuggest={setSuggestQuery}
              {...invalidProps("branch", errors.fields.branchId)}
            />
          </Field>
          {match ? null : (
            <p className="-mt-1 text-xs text-muted-foreground">
              Los jugadores disponibles de ese día se mostrarán filtrados por la
              sucursal de este partido.
            </p>
          )}
          <SuggestBranchDialog
            open={suggestQuery !== null}
            onOpenChange={(open) => !open && setSuggestQuery(null)}
            initialName={suggestQuery ?? ""}
          />
        </Section>
      ) : null}

      {step === 1 ? (
        <>
          <Section title="El partido">
            <Field label="Categoría">
              <Select
                value={category.toString()}
                onValueChange={(value) =>
                  setCategory(Number(value) as Category)
                }
              >
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
            </Field>

            <Field label="Tipo">
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value as MatchType)}
                className="grid grid-cols-3 gap-2"
              >
                {(Object.keys(TYPE_LABELS) as MatchType[]).map((value) => (
                  <Label
                    key={value}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
                  >
                    <RadioGroupItem value={value} />
                    {TYPE_LABELS[value]}
                  </Label>
                ))}
              </RadioGroup>
            </Field>
            <CategoryTierPicker
              id="categoryTier"
              value={categoryTier}
              onChange={(value) => {
                setCategoryTier(value);
                clearField("categoryTier");
              }}
              error={errors.fields.categoryTier}
            />
            <Field label="Jugadores en el partido">
              <Select
                value={maxPlayers}
                onValueChange={(value) => {
                  setMaxPlayers(value);
                  setGuests((current) => current.slice(0, Number(value) - 1));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 jugadores</SelectItem>
                  <SelectItem value="5">5 jugadores (rotación)</SelectItem>
                  <SelectItem value="6">6 jugadores (rotación)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section title="¿Ya tienes jugadores?">
            <p className="text-sm text-muted-foreground">
              Tú cuentas como uno. Agrega a quienes ya confirmaron; no necesitan
              cuenta en MatchPa.
            </p>
            <ul className="space-y-3">
              {guests.map((guest, index) => (
                <li key={index}>
                  <Card className="gap-3 py-3">
                    <CardContent className="grid gap-3">
                      <div className="flex gap-2">
                        <Input
                          aria-label="Nombre"
                          placeholder="Nombre"
                          value={guest.name}
                          onChange={(e) => {
                            updateGuest(index, { name: e.target.value });
                            clearField(`guests.${index}.name`);
                          }}
                          {...invalidProps(
                            `guest-${index}`,
                            errors.fields[`guests.${index}.name`],
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setGuests((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Quitar
                        </Button>
                      </div>
                      <FieldError id={`guest-${index}-error`} className="-mt-1">
                        {errors.fields[`guests.${index}.name`]}
                      </FieldError>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={guest.category.toString()}
                          onValueChange={(value) =>
                            updateGuest(index, {
                              category: Number(value) as Category,
                            })
                          }
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-label="Categoría"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((value) => (
                              <SelectItem key={value} value={value.toString()}>
                                {shortCategory(value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={guest.gender}
                          onValueChange={(value) =>
                            updateGuest(index, { gender: value as Gender })
                          }
                        >
                          <SelectTrigger className="w-full" aria-label="Género">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(GENDER_LABELS) as Gender[]).map(
                              (value) => (
                                <SelectItem key={value} value={value}>
                                  {GENDER_LABELS[value]}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={guests.length >= seatsForGuests}
              onClick={() =>
                setGuests((current) => [
                  ...current,
                  { name: "", category, gender: "male" },
                ])
              }
            >
              Agregar jugador
            </Button>
          </Section>
        </>
      ) : null}

      <FormAlert message={errors.form} />

      <div className="flex gap-2">
        {step === 1 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 flex-1"
            onClick={() => setStep(0)}
          >
            Atrás
          </Button>
        ) : null}
        {step === 0 ? (
          <Button
            type="button"
            size="lg"
            className="h-12 flex-1 font-bold"
            onClick={goNext}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="submit"
            data-publish
            size="lg"
            disabled={busy || !publishReady}
            className="h-12 flex-1 font-bold"
          >
            {busy
              ? "Guardando…"
              : match
                ? "Guardar cambios"
                : "Publicar partido"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>
        {error}
      </FieldError>
    </div>
  );
}

const STEP_ONE_FIELDS = new Set([
  "branchId",
  "courtNumber",
  "startsAt",
  "durationMinutes",
]);

function whereErrors(branchId: string, courtNumber: string): FieldErrors {
  return {
    ...(branchId ? {} : { branchId: "Elige la sucursal de la cancha" }),
    ...(courtNumber ? {} : { courtNumber: "Indica el número de cancha" }),
  };
}

function validDate(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= todayKey() ? value : null;
}

function guestErrors(guests: GuestDraft[]): FieldErrors {
  return Object.fromEntries(
    guests.flatMap((guest, index) =>
      guest.name.trim()
        ? []
        : [[`guests.${index}.name`, "Pon el nombre del jugador"]],
    ),
  );
}

/** Each visit to the publish page carries a new `n`, so the form starts clean instead of reusing a kept-alive instance. */
export function MatchForm({ match }: { match?: Match }) {
  const visit = useSearchParams().get("n") ?? "edit";
  return <MatchFormBody key={visit} match={match} />;
}

/** Every half hour of the day, plus the current value when it is off the grid (an edited match). */
function timeOptions(current: string): string[] {
  const halfHours = Array.from({ length: 48 }, (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    return `${hours}:${i % 2 === 0 ? "00" : "30"}`;
  });
  return halfHours.includes(current)
    ? halfHours
    : [current, ...halfHours].sort();
}
