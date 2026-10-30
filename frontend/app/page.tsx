import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { jsonLdHtml, SITE_JSON_LD, SITE_OPEN_GRAPH } from "@/lib/seo";

const TITLE = "MatchPa — ¿Te falta una pala? Encuéntrala aquí";
const DESCRIPTION =
  "Jugadores disponibles y partidos de pádel buscando pala en Panamá, por categoría, empresa y horario. Publica tu partido y compártelo por WhatsApp.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { ...SITE_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: "/" },
};

const STEPS = [
  { title: "Publica tu partido", text: "Ya tienes cancha y te faltan 1 o 2? Carga la hora, la empresa y los que ya confirmaron." },
  { title: "Compártelo", text: "Mándalo al grupo de WhatsApp o a tus amigos con un link." },
  { title: "¡Match!", text: "Apruebas a quien pide unirse, y listo: ya están los 4." },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 pt-10 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(SITE_JSON_LD) }}
      />
      <section className="space-y-6">
        <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">ey Pa, ¿juegas?</p>
        <h1 className="font-heading text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          ¿Te falta una pala?
          <span className="block text-brand-teal dark:text-brand-lime">Encuéntrala aquí.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Jugadores disponibles y partidos buscando pala, por categoría, empresa y horario. Sin scrollear el chat del grupo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 text-base font-bold">
            <Link href="/lobby">Entrar al lobby</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">{index + 1}</p>
            <h2 className="font-heading text-xl font-bold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
