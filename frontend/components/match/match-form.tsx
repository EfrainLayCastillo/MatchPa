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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { leadTime, track } from "@/lib/analytics";
import { clearInvitee, readInvitee, type Invitee } from "@/lib/invitee-handoff";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import { refreshMatchPage } from "@/app/partidos/[code]/actions";
import {
  invalidProps,
  toFormErrors,
  useFormErrors,
  type FieldErrors,
} from "@/lib/form-errors";
import { FormAlert } from "@/components/matchpa/form-alert";
import { WHITE_FIELDS } from "@/lib/field-styles";
import { InviteNotice } from "@/components/matchpa/invite-notice";
import { FieldError } from "@/components/ui/field";
import { CategoryTierPicker } from "@/components/matchpa/category-tier-picker";
import {
  CATEGORIES,
  GENDER_LABELS,
  MATCH_DURATIONS,
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
  MatchDuration,
  MatchType,
  NewMatchInput,
} from "@/lib/types";

interface GuestDraft {
  name: string;
  category: Category;
  categoryTier: CategoryTier | null;
  gender: Gender;
}

function MatchFormBody({ match }: { match?: Match }) {
  const { user } = useSession();
  const { handleError } = useVerifiedAction();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invitee, setInvitee] = useState<Invitee | null>(null);
  const inviteeId = invitee?.id ?? null;
  const inviteeName = invitee?.name ?? null;
  const presetDate = match ? null : searchParams.get("fecha");
  const presetBranch = match ? null : searchParams.get("sucursal");
  const fromInviteFlow = presetDate !== null && presetBranch !== null;
  useEffect(() => {
    if (match || !fromInviteFlow) return;
    const stored = readInvitee();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists on the client
    if (stored) setInvitee(stored);
  }, [match, fromInviteFlow]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [date, setDate] = useState(() =>
    match
      ? dateKey(new Date(match.startsAt))
      : (validDate(presetDate) ?? todayKey()),
  );
  const [time, setTime] = useState(() =>
    match ? formatClock(match.startsAt) : keepUpcoming("18:00", date),
  );
  const [duration, setDuration] = useState<MatchDuration>(
    match?.durationMinutes ?? 90,
  );
  const [branchId, setBranchId] = useState(
    match ? String(match.branch.id) : (presetBranch ?? ""),
  );
  const [suggestQuery, setSuggestQuery] = useState<string | null>(null);
  const [courtBooked, setCourtBooked] = useState(match?.courtBooked ?? true);
  const [courtNumber, setCourtNumber] = useState(
    match?.courtNumber != null ? String(match.courtNumber) : "",
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
      ? match.guests.map(({ name, category, categoryTier, gender }) => ({
          name: name ?? "",
          category,
          categoryTier,
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

  const acceptedPlayers =
    match?.requests?.filter((request) => request.status === "accepted").length ?? 0;
  const seatsForGuests = Number(maxPlayers) - 1 - acceptedPlayers;
  const branchLocked =
    inviteeId !== null && presetBranch !== null && branchId === presetBranch;
  const dateLocked = inviteeId !== null && date === validDate(presetDate);
  const whereComplete =
    Object.keys(whereErrors(branchId, courtBooked, courtNumber)).length === 0;

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
      courtBooked,
      courtNumber: courtBooked ? Number(courtNumber) : null,
      startsAt: new Date(`${date}T${time}:00-05:00`).toISOString(),
      durationMinutes: duration,
      category,
      categoryTier,
      type,
      maxPlayers: Number(maxPlayers),
      guests: guests.map((guest) => ({ ...guest, name: guest.name.trim() })),
    };
  }

  function goNext() {
    const fields = whereErrors(branchId, courtBooked, courtNumber);
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
      ...whereErrors(branchId, courtBooked, courtNumber),
      ...guestErrors(guests),
    };
    if (Object.keys(fields).length > 0)
      return showErrors({ fields, form: null });

    setBusy(true);
    reset();
    try {
      if (match) {
        const updated = await api.updateMatch(match.code, buildInput());
        await refreshMatchPage(updated.code).catch(() => {});
        router.push(`/partidos/${updated.code}`);
        return;
      }
      const published = await api.createMatch(buildInput());
      clearInvitee();
      track("publish_match", {
        match_type: published.type,
        category: published.category,
        max_players: published.maxPlayers,
        branch: published.branch.slug,
        guests: published.guests.length,
        from_invite: inviteeId !== null,
        court_booked: published.courtBooked,
        lead_time: leadTime(published.startsAt),
      });
      if (inviteeId)
        await api
          .invite(published.code, inviteeId)
          .then(() =>
            track("invite_player", {
              branch: published.branch.slug,
              entry_point: "new_match",
            }),
          )
          .catch(() => null);
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
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className={`space-y-6 ${WHITE_FIELDS}`}
    >
      {inviteeId ? (
        <InviteNotice>
          Al publicar le enviaremos la invitación a{" "}
          <strong>{inviteeName}</strong>.
        </InviteNotice>
      ) : null}
      <Tabs
        value={String(step)}
        onValueChange={(value) => (value === "1" ? goNext() : setStep(0))}
      >
        <TabsList className="w-full">
          <TabsTrigger value="0">Cuándo y dónde</TabsTrigger>
          <TabsTrigger value="1" disabled={!whereComplete}>
            El partido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="0" className="mt-4 space-y-3">
          <Field label="Fecha" htmlFor="date">
            <DateField
              id="date"
              value={date}
              min={todayKey()}
              onChange={(next) => {
                setDate(next);
                setTime((current) => keepUpcoming(current, next));
              }}
              disabled={dateLocked}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
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
                  {timeOptions(time, date).map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatClock12(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Duración">
              <Select
                value={String(duration)}
                onValueChange={(value) =>
                  setDuration(Number(value) as MatchDuration)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_DURATIONS.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Reserva de la cancha">
            <RadioGroup
              value={courtBooked ? "booked" : "pending"}
              onValueChange={(value) => {
                setCourtBooked(value === "booked");
                clearField("courtNumber");
              }}
              className="grid gap-2"
            >
              {COURT_OPTIONS.map(({ value, label }) => (
                <Label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime"
                >
                  <RadioGroupItem value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
          </Field>
          {courtBooked ? (
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
                max={50}
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
          ) : (
            <p className="text-sm text-muted-foreground">
              Te avisamos cuando se complete para que la reserves.
            </p>
          )}
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
              disabled={branchLocked}
              {...invalidProps("branch", errors.fields.branchId)}
            />
          </Field>
          {match ? null : (
            <p className="-mt-1 text-xs text-muted-foreground">
              {branchLocked || dateLocked
                ? `Fecha y sucursal fijas: son las de la disponibilidad de ${inviteeName ?? "tu invitado"}.`
                : "Los jugadores disponibles de ese día se mostrarán filtrados por la sucursal de este partido."}
            </p>
          )}
          <SuggestBranchDialog
            open={suggestQuery !== null}
            onOpenChange={(open) => !open && setSuggestQuery(null)}
            initialName={suggestQuery ?? ""}
          />
        </TabsContent>

        <TabsContent value="1" className="mt-4 space-y-6">
          <div className="space-y-3">
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
            <CategoryTierPicker
              id="categoryTier"
              value={categoryTier}
              onChange={(value) => {
                setCategoryTier(value);
                clearField("categoryTier");
              }}
              error={errors.fields.categoryTier}
            />

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
          </div>

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
                      <div className="grid gap-3">
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
                        <CategoryTierPicker
                          id={`guest-${index}-tier`}
                          value={guest.categoryTier}
                          onChange={(value) =>
                            updateGuest(index, { categoryTier: value })
                          }
                        />
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
                  { name: "", category, categoryTier: null, gender: "male" },
                ])
              }
            >
              Agregar jugador
            </Button>
          </Section>
        </TabsContent>
      </Tabs>

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
                : "Crear nuevo partido"}
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

const COURT_OPTIONS = [
  { value: "booked", label: "Ya reservé la cancha" },
  { value: "pending", label: "La reservo cuando se complete" },
];

const STEP_ONE_FIELDS = new Set([
  "branchId",
  "courtNumber",
  "startsAt",
  "durationMinutes",
]);

function whereErrors(
  branchId: string,
  courtBooked: boolean,
  courtNumber: string,
): FieldErrors {
  return {
    ...(branchId ? {} : { branchId: "Elige la sucursal de la cancha" }),
    ...(!courtBooked || courtNumber ? {} : { courtNumber: "Indica el número de cancha" }),
  };
}

function validDate(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= todayKey()
    ? value
    : null;
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

const HALF_HOURS = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  return `${hours}:${i % 2 === 0 ? "00" : "30"}`;
});

/** Half hours still ahead on `date` (all of them on a later day), in Panama time. */
function upcomingHalfHours(date: string): string[] {
  if (date !== todayKey()) return HALF_HOURS;
  const now = formatClock(new Date().toISOString());
  return HALF_HOURS.filter((slot) => slot > now);
}

/** Upcoming half hours, plus the current value when it is off the grid (an edited match). */
function timeOptions(current: string, date: string): string[] {
  const upcoming = upcomingHalfHours(date);
  return upcoming.includes(current) || current < (upcoming[0] ?? "24:00")
    ? upcoming
    : [current, ...upcoming].sort();
}

/** Keeps `time` when still ahead on `date`; otherwise moves it to the next free half hour. */
function keepUpcoming(time: string, date: string): string {
  const upcoming = upcomingHalfHours(date);
  if (upcoming.length === 0 || time > upcoming[0]) return time;
  return upcoming[0];
}
