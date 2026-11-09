import type { Metadata } from "next";
import Link from "next/link";
import { BetaPill } from "@/components/matchpa/beta-badge";
import { StepCards } from "@/components/matchpa/step-cards";
import { UpcomingFeatures } from "@/components/matchpa/upcoming-features";
import { Button } from "@/components/ui/button";
import { jsonLdHtml, SITE_JSON_LD, SITE_OPEN_GRAPH } from "@/lib/seo";

const TITLE = "MatchPa — ¿Te falta una pala? Encuéntrala aquí";
const DESCRIPTION =
  "Jugadores disponibles y partidos de pádel buscando pala en Panamá, por categoría, sucursal y horario. Publica tu partido y compártelo por WhatsApp.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    ...SITE_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
};

const STEPS = [
  {
    title: "Publica tu partido",
    text: "Ya tienes cancha y te faltan 1 o 2? Carga la hora, la sucursal y los que ya confirmaron.",
  },
  {
    title: "Compártelo",
    text: "Mándalo al grupo de WhatsApp o a tus amigos con un link.",
  },
  {
    title: "¡Match!",
    text: "Apruebas a quien pide unirse, y listo: ya están los 4.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-16 pt-10 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(SITE_JSON_LD) }}
      />
      <section className="space-y-6">
        <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">
          ey Pa, ¿juegas?
        </p>
        <h1 className="font-heading text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          ¿Te falta una pala?
          <span className="block text-brand-teal dark:text-brand-lime">
            Encuéntrala aquí.
          </span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Jugadores disponibles y partidos buscando pala, por categoría,
          sucursal y horario. Sin scrollear el chat del grupo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 text-base font-bold">
            <Link href="/lobby">Entrar al lobby</Link>
          </Button>
        </div>
      </section>

      <StepCards steps={STEPS} heading="h2" className="md:grid-cols-3" />

      <section
        aria-labelledby="beta"
        className="space-y-5 rounded-3xl bg-brand-teal p-6 text-brand-ivory sm:p-8"
      >
        <div className="space-y-2">
          <BetaPill large />
          <h2
            id="beta"
            className="font-heading text-3xl font-extrabold leading-tight"
          >
            Esto apenas{" "}
            <span className="font-script text-[1.15em] font-normal text-brand-lime">
              arranca.
            </span>
          </h2>
          <p className="text-brand-ivory/80">
            Lo esencial ya funciona y vamos sumando lo que nos piden en la
            cancha.
          </p>
        </div>
        <div className="flex items-center gap-4" aria-hidden>
          <span className="font-script text-3xl text-brand-lime sm:text-4xl">
            esto es lo próximo
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-brand-lime/70 to-transparent" />
        </div>
        <UpcomingFeatures />
        <Link
          href="/beta"
          className="inline-flex min-h-11 items-center font-semibold text-brand-lime underline-offset-4 hover:underline"
        >
          Conoce la historia y cómo se usa →
        </Link>
      </section>
    </div>
  );
}
