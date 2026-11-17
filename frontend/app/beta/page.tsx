import type { Metadata } from "next";
import Link from "next/link";
import { BetaPill } from "@/components/matchpa/beta-badge";
import { ContactLink } from "@/components/matchpa/contact-link";
import { StepCards } from "@/components/matchpa/step-cards";
import { UpcomingFeatures } from "@/components/matchpa/upcoming-features";
import { Button } from "@/components/ui/button";
import { SITE_OPEN_GRAPH } from "@/lib/seo";

const TITLE = "MatchPa está en beta";
const DESCRIPTION =
  "Hecho por jugadores para jugadores: completa tu partido sin perderte en los grupos de WhatsApp. Cómo se usa y lo que viene.";

export const metadata: Metadata = {
  title: "Beta",
  description: DESCRIPTION,
  alternates: { canonical: "/beta" },
  openGraph: { ...SITE_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: "/beta" },
};

const CHAT = [
  { author: "Grupo de la sucursal", text: "¿Quién disponible para las 6pm? Buscamos pala de 4ta categoría 🎾" },
  { author: "Grupo de pádel", text: "Partido mixto, ya somos 3. Buscamos una pala disponible" },
];

const HOW_TO = [
  { title: "Completa tu perfil", text: "Categoría, género y WhatsApp, una sola vez." },
  { title: "Publica o busca", text: "¿Te falta gente? Publica el partido. ¿Quieres jugar? Mira el lobby." },
  { title: "Ponte disponible", text: "Marca el día y los organizadores te invitan: \"Ey Pa, ¿juegas?\"." },
  { title: "¡Match!", text: "El organizador acepta y, cuando están los 4, a jugar." },
];

export default function BetaPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 pb-20 pt-10 sm:pt-16">
      <header className="space-y-4">
        <BetaPill large />
        <h1 className="font-heading text-4xl font-extrabold leading-[0.95] sm:text-6xl">
          Hecho por jugadores,
          <span className="block font-script text-[1.15em] font-normal text-brand-teal dark:text-brand-lime">para jugadores.</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          MatchPa es para quienes juegan pádel y tienen un partido que completar. Está en beta: lo esencial ya funciona
          y lo vamos mejorando con lo que nos cuentas.
        </p>
      </header>

      <section aria-labelledby="problema" className="space-y-4">
        <h2 id="problema" className="font-heading text-2xl font-bold">El problema que resolvemos</h2>
        <div className="space-y-2">
          {CHAT.map((message) => (
            <figure key={message.author} className="max-w-sm rounded-2xl rounded-tl-sm bg-muted p-3 even:ml-auto even:rounded-tl-2xl even:rounded-tr-sm">
              <figcaption className="text-xs font-semibold text-brand-teal dark:text-brand-turquoise">{message.author}</figcaption>
              <blockquote className="text-sm">{message.text}</blockquote>
            </figure>
          ))}
        </div>
        <p className="text-muted-foreground">
          La cancha está reservada y falta 1. El mensaje se pierde entre stickers y audios, y el partido se cae. En
          MatchPa, los partidos que buscan gente y los jugadores con ganas se encuentran por categoría, sucursal y
          horario.
        </p>
      </section>

      <section aria-labelledby="como" className="space-y-4">
        <h2 id="como" className="font-heading text-2xl font-bold">Cómo se usa</h2>
        <StepCards steps={HOW_TO} heading="h3" className="sm:grid-cols-2" />
      </section>

      <section aria-labelledby="viene" className="space-y-4">
        <div className="space-y-1">
          <p className="font-script text-2xl text-brand-teal dark:text-brand-lime">lo que viene</p>
          <h2 id="viene" className="font-heading text-2xl font-bold">Lo que estamos preparando</h2>
        </div>
        <UpcomingFeatures />
        <p className="rounded-2xl border border-brand-turquoise/40 bg-brand-turquoise/10 p-4 text-sm">
          ¿Una idea o algo que no funciona? Escríbenos a <ContactLink />: cada mensaje se vuelve una mejora.
        </p>
      </section>

      <div className="rounded-2xl bg-brand-teal p-6 text-brand-ivory">
        <p className="font-heading text-2xl font-bold">¿Te falta una pala?</p>
        <p className="mt-1 text-brand-ivory/80">Lo esencial ya está listo.</p>
        <Button asChild size="lg" className="mt-4 h-12 w-full bg-brand-lime text-base font-bold text-brand-teal hover:bg-brand-lime/90 sm:w-auto">
          <Link href="/lobby">Entrar al lobby</Link>
        </Button>
      </div>
    </div>
  );
}
