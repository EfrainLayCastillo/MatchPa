"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/matchpa/date-field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, GENDER_LABELS, shortCategory, TYPE_LABELS } from "@/lib/format";
import { dateKey, formatClock, formatClock12, todayKey } from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { Category, Company, Gender, Match, MatchType, NewMatchInput } from "@/lib/types";

interface GuestDraft {
  name: string;
  category: Category;
  gender: Gender;
}

function MatchFormBody({ match }: { match?: Match }) {
  const { user } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteeId = match ? null : Number(searchParams.get("invitar")) || null;
  const inviteeName = searchParams.get("nombre");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [date, setDate] = useState(() => (match ? dateKey(new Date(match.startsAt)) : todayKey()));
  const [time, setTime] = useState(() => (match ? formatClock(match.startsAt) : "18:00"));
  const [duration, setDuration] = useState<"90" | "120">(match ? (String(match.durationMinutes) as "90" | "120") : "90");
  const [companyId, setCompanyId] = useState(match ? String(match.company.id) : "");
  const [courtNumber, setCourtNumber] = useState(match ? String(match.courtNumber) : "");
  const [category, setCategory] = useState<Category>(match?.category ?? user?.category ?? 4);
  const [type, setType] = useState<MatchType>(match?.type ?? "mixed");
  const [maxPlayers, setMaxPlayers] = useState(match ? String(match.maxPlayers) : "4");
  const [guests, setGuests] = useState<GuestDraft[]>(() =>
    match ? match.guests.map(({ name, category, gender }) => ({ name, category, gender })) : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Match | null>(null);
  const [step, setStep] = useState(0);
  // The publish button sits where "Siguiente" was; it stays disabled briefly so a second tap can't publish by accident.
  const [publishReady, setPublishReady] = useState(false);

  const seatsForGuests = Number(maxPlayers) - 1;

  useEffect(() => {
    api.companies().then(setCompanies).catch(() => {});
  }, []);

  function updateGuest(index: number, patch: Partial<GuestDraft>) {
    setGuests((current) => current.map((guest, i) => (i === index ? { ...guest, ...patch } : guest)));
  }

  function buildInput(): NewMatchInput {
    return {
      companyId: Number(companyId),
      courtNumber: Number(courtNumber),
      startsAt: new Date(`${date}T${time}:00-05:00`).toISOString(),
      durationMinutes: Number(duration) as 90 | 120,
      category,
      type,
      maxPlayers: Number(maxPlayers),
      guests: guests.map((guest) => ({ ...guest, name: guest.name.trim() })),
    };
  }

  function goNext() {
    if (!companyId) return setError("Elige la empresa de la cancha");
    if (!courtNumber) return setError("Indica el número de cancha");
    setError(null);
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
    if (!companyId) return setError("Elige la empresa de la cancha");
    if (!courtNumber) return setError("Indica el número de cancha");
    if (guests.some((guest) => guest.name.trim() === "")) return setError("Pon el nombre de cada jugador");

    setBusy(true);
    setError(null);
    try {
      if (match) {
        const updated = await api.updateMatch(match.code, buildInput());
        router.push(`/partidos/${updated.code}`);
        return;
      }
      const published = await api.createMatch(buildInput());
      if (inviteeId) await api.invite(published.code, inviteeId).catch(() => null);
      if (shouldAskForPush()) {
        setCreated(published);
        return;
      }
      router.push(`/partidos/${published.code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo publicar el partido");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div className="space-y-4">
        <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">¡Listo!</p>
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
    <form onSubmit={submit} className="space-y-6">
      {inviteeId ? (
        <p className="rounded-xl bg-brand-lime/40 p-3 text-sm">
          Al publicar le enviaremos la invitación a <strong>{inviteeName}</strong>.
        </p>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso {step + 1} de 2</p>

      {step === 0 ? (
      <Section title="Cuándo y dónde">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" htmlFor="date">
            <DateField id="date" value={date} min={todayKey()} onChange={setDate} />
          </Field>
          <Field label="Hora" htmlFor="time">
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="time" className="w-full" aria-label="Hora">
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
            <Select value={duration} onValueChange={(value) => setDuration(value as "90" | "120")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cancha" htmlFor="court">
            <Input id="court" type="number" inputMode="numeric" min={1} placeholder="Ej. 3" value={courtNumber} onChange={(e) => setCourtNumber(e.target.value)} required />
          </Field>
        </div>
        <Field label="Empresa">
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Elige una empresa" /></SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name} · {company.locationLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>
      ) : null}

      {step === 1 ? (
      <>
      <Section title="El partido">
        <Field label="Categoría">
          <Select value={category.toString()} onValueChange={(value) => setCategory(Number(value) as Category)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((value) => (
                <SelectItem key={value} value={value.toString()}>{shortCategory(value)} categoría</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tipo">
          <RadioGroup value={type} onValueChange={(value) => setType(value as MatchType)} className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_LABELS) as MatchType[]).map((value) => (
              <Label key={value} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium has-[[data-state=checked]]:border-brand-teal has-[[data-state=checked]]:bg-brand-lime/40 dark:has-[[data-state=checked]]:border-brand-lime">
                <RadioGroupItem value={value} />
                {TYPE_LABELS[value]}
              </Label>
            ))}
          </RadioGroup>
        </Field>
        <Field label="Jugadores en el partido">
          <Select value={maxPlayers} onValueChange={(value) => {
            setMaxPlayers(value);
            setGuests((current) => current.slice(0, Number(value) - 1));
          }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
          Tú cuentas como uno. Agrega a quienes ya confirmaron; no necesitan cuenta en MatchPa.
        </p>
        <ul className="space-y-3">
          {guests.map((guest, index) => (
            <li key={index}>
              <Card className="gap-3 py-3">
                <CardContent className="grid gap-3">
                  <div className="flex gap-2">
                    <Input aria-label="Nombre" placeholder="Nombre" value={guest.name} onChange={(e) => updateGuest(index, { name: e.target.value })} />
                    <Button type="button" variant="ghost" onClick={() => setGuests((current) => current.filter((_, i) => i !== index))}>
                      Quitar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={guest.category.toString()} onValueChange={(value) => updateGuest(index, { category: Number(value) as Category })}>
                      <SelectTrigger className="w-full" aria-label="Categoría"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((value) => (
                          <SelectItem key={value} value={value.toString()}>{shortCategory(value)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={guest.gender} onValueChange={(value) => updateGuest(index, { gender: value as Gender })}>
                      <SelectTrigger className="w-full" aria-label="Género"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(GENDER_LABELS) as Gender[]).map((value) => (
                          <SelectItem key={value} value={value}>{GENDER_LABELS[value]}</SelectItem>
                        ))}
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
          onClick={() => setGuests((current) => [...current, { name: "", category, gender: "male" }])}
        >
          Agregar jugador
        </Button>
      </Section>
      </>
      ) : null}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        {step === 1 ? (
          <Button type="button" variant="outline" size="lg" className="h-12 flex-1" onClick={() => setStep(0)}>
            Atrás
          </Button>
        ) : null}
        {step === 0 ? (
          <Button type="button" size="lg" className="h-12 flex-1 font-bold" onClick={goNext}>
            Siguiente
          </Button>
        ) : (
          <Button type="submit" data-publish size="lg" disabled={busy || !publishReady} className="h-12 flex-1 font-bold">
            {busy ? "Guardando…" : match ? "Guardar cambios" : "Publicar partido"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
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
  return halfHours.includes(current) ? halfHours : [current, ...halfHours].sort();
}
