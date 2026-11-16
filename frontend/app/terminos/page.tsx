import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { PRIVACY_EMAIL } from "@/lib/legal";
import { SITE_OPEN_GRAPH } from "@/lib/seo";

const TITLE = "Términos de uso";
const DESCRIPTION = "Las reglas para usar MatchPa: tu cuenta, cómo jugar con respeto y qué esperar de la beta.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terminos" },
  openGraph: { ...SITE_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: "/terminos" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "que-es",
    title: "Qué es MatchPa",
    body: (
      <>
        <p>
          MatchPa conecta jugadores de pádel para completar partidos. Un organizador publica un partido al que le falta
          gente y los jugadores piden unirse o reciben una invitación.
        </p>
        <p>
          <strong>MatchPa no reserva canchas, no cobra y no organiza los partidos.</strong> La cancha, el horario, el
          pago y todo lo que pasa en la cancha se arreglan entre los jugadores y la sucursal.
        </p>
      </>
    ),
  },
  {
    id: "cuenta",
    title: "Tu cuenta y requisitos",
    body: (
      <ul>
        <li>Para crear una cuenta debes tener <strong>18 años o más</strong>.</li>
        <li>Los datos que pongas (nombre, categoría, género y WhatsApp) tienen que ser verdaderos y estar al día.</li>
        <li>Tu cuenta es personal. Cuídala y no la compartas: lo que se haga con ella es responsabilidad tuya.</li>
        <li>Puedes tener una sola cuenta por persona.</li>
      </ul>
    ),
  },
  {
    id: "conducta",
    title: "Cómo se juega aquí",
    body: (
      <ul>
        <li>Si el organizador te aceptó, preséntate. Si no puedes ir, sal del partido a tiempo para que liberen tu puesto.</li>
        <li>Trata con respeto a los demás jugadores, antes, durante y después del partido.</li>
        <li>
          El WhatsApp de otros jugadores es para coordinar el partido y nada más. No lo uses para publicidad, spam,
          acoso ni lo compartas con terceros.
        </li>
        <li>No publiques partidos falsos ni te hagas pasar por otra persona.</li>
        <li>No intentes dañar el servicio, saltarte sus límites ni acceder a cuentas ajenas.</li>
      </ul>
    ),
  },
  {
    id: "suspension",
    title: "Suspensión y eliminación de cuentas",
    body: (
      <>
        <p>
          Podemos suspender o eliminar una cuenta que incumpla estos términos, por ejemplo por acoso, uso indebido del
          WhatsApp de otros o partidos falsos.
        </p>
        <p>
          Tú puedes eliminar tu cuenta cuando quieras desde el final de tu perfil. Qué pasa con tus datos está en la{" "}
          <Link href="/privacidad#conservacion">Política de privacidad</Link>.
        </p>
      </>
    ),
  },
  {
    id: "beta",
    title: "Beta y funciones futuras",
    body: (
      <>
        <p>
          MatchPa está en beta y hoy no tiene costo. Algo puede cambiar de lugar, fallar o dejar de estar disponible
          mientras mejoramos.
        </p>
        <p>
          En el futuro podrían existir funciones de pago. Si llega ese momento, te avisamos antes y publicamos una
          nueva versión de estos términos que tendrás que aceptar para seguir usando MatchPa.
        </p>
      </>
    ),
  },
  {
    id: "responsabilidad",
    title: "Responsabilidad limitada",
    body: (
      <>
        <p>
          Ofrecemos MatchPa tal como está. No garantizamos que siempre funcione sin fallos ni que encuentres jugadores
          para cada partido.
        </p>
        <p>
          No somos responsables de lo que ocurra entre jugadores o en la cancha, como lesiones, cancelaciones, pagos o
          desacuerdos, ni de la información que otros usuarios pongan en su perfil. Tampoco respondemos por daños
          indirectos derivados del uso del servicio, en la medida que lo permita la ley.
        </p>
      </>
    ),
  },
  {
    id: "ley",
    title: "Ley aplicable",
    body: <p>Estos términos se rigen por las leyes de la República de Panamá.</p>,
  },
  {
    id: "contacto",
    title: "Contacto",
    body: (
      <p>
        ¿Dudas sobre estos términos? Escríbenos a <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Para saber
        cómo tratamos tus datos, lee la <Link href="/privacidad">Política de privacidad</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Términos de uso"
      intro="Lo básico para que todos jueguen tranquilos. Al crear tu cuenta aceptas estos términos."
      sections={SECTIONS}
    />
  );
}
