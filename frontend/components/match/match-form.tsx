"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, GENDER_LABELS, panamaDateKey, panamaTime, shortCategory, TYPE_LABELS } from "@/lib/format";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { Category, Company, Gender, Match, MatchType, NewMatchInput } from "@/lib/types";
import { ShareMatch } from "./share-match";

interface GuestDraft {
  name: string;
  category: Category;
  gender: Gender;
}

export function MatchForm({ match }: { match?: Match }) {
  const { user } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [date, setDate] = useState(() => (match ? panamaDateKey(new Date(match.startsAt)) : panamaDateKey()));
  const [time, setTime] = useState(() => (match ? panamaTime(match.startsAt) : "18:00"));
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
  const [published, setPublished] = useState<Match | null>(null);
  const [pushOpen, setPushOpen] = useState(false);

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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
      setPublished(await api.createMatch(buildInput()));
      if (shouldAskForPush()) setPushOpen(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo publicar el partido");
    } finally {
      setBusy(false);
    }
  }

  if (published) {
    const company = companies.find((c) => c.id === published.company.id) ?? published.company;
    const summary = `Partido de pádel en ${company.name}, cancha ${published.courtNumber}. Faltan ${published.spotsLeft} puestos.`;
    return (
      <div className="space-y-4">
        <div>
          <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">¡Listo!</p>
          <p className="text-sm text-muted-foreground">Tu partido ya está en el lobby. Compártelo para completar los puestos.</p>
        </div>
        <ShareMatch code={published.code} summary={summary} />
        <Button asChild variant="outline" className="w-full">
          <Link href={`/partidos/${published.code}`}>Ver partido</Link>
        </Button>
        <PushPrompt
          open={pushOpen}
          onOpenChange={setPushOpen}
          reason="Te avisamos cuando alguien pida unirse a tu partido."
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Cuándo y dónde">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" htmlFor="date">
            <Input id="date" type="date" value={date} min={panamaDateKey()} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Hora" htmlFor="time">
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
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

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={busy} className="h-12 w-full text-base font-bold">
        {busy ? "Guardando…" : match ? "Guardar cambios" : "Publicar partido"}
      </Button>
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
