import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalTable, type LegalSection } from "@/components/legal/legal-page";
import { PRIVACY_EMAIL } from "@/lib/legal";
import { SITE_OPEN_GRAPH } from "@/lib/seo";

const TITLE = "Política de privacidad";
const DESCRIPTION = "Qué datos guarda MatchPa, para qué los usa, quién los ve y cómo ejercer tus derechos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacidad" },
  openGraph: { ...SITE_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: "/privacidad" },
};

const DATA_HEAD = ["Dato", "Para qué", "Quién lo ve"];
const DATA_ROWS = [
  ["Nombre", "Identificarte en partidos, solicitudes e invitaciones.", "Cualquiera con el link del partido, aunque no tenga cuenta."],
  ["Correo", "Iniciar sesión, verificar tu cuenta, recuperar tu contraseña y avisarte.", "Solo tú y MatchPa."],
  ["Contraseña", "Iniciar sesión. Se guarda hasheada, nunca en texto legible.", "Nadie."],
  ["Cuenta de Google", "Entrar con Google. Guardamos el identificador de Google vinculado a tu cuenta.", "Solo MatchPa."],
  ["Foto", "Mostrar tu avatar, si tu cuenta tiene una (por ejemplo, la de Google).", "Otros jugadores."],
  ["WhatsApp", "Si organizas un partido, que los jugadores de ese partido te escriban por WhatsApp. Se guarda cifrado.", "Los jugadores aceptados o que aceptaron tu invitación, mientras el partido está abierto o completo."],
  ["Categoría, subnivel y género", "Encontrar partidos que van contigo y respetar partidos masculinos, femeninos o mixtos.", "Cualquiera con el link del partido, aunque no tenga cuenta."],
  ["Disponibilidad", "Que los organizadores vean quién puede jugar y te inviten.", "Usuarios con sesión iniciada."],
  ["Solicitudes y partidos", "Gestionar partidos que publicas, pides o te invitan, y el historial.", "Los jugadores de ese partido."],
  ["Suscripciones push", "Enviarte avisos de invitaciones, solicitudes y cambios en tu partido.", "Solo MatchPa y el servicio de notificaciones de tu navegador."],
  ["Códigos de verificación", "Verificar tu correo y recuperar tu contraseña. Se guardan con un hash y vencen en minutos.", "Nadie."],
  ["Sugerencias de sucursal", "Revisar y agregar sucursales que nos propones.", "Solo MatchPa."],
  ["Analítica (Google Analytics)", "Medir cómo se usa el sitio. Los eventos no llevan datos personales.", "MatchPa y Google."],
];

const PROVIDERS = [
  ["Vercel", "Aloja el sitio web."],
  ["Render", "Aloja el servidor de MatchPa."],
  ["Neon", "Guarda la base de datos."],
  ["Resend", "Envía los correos de verificación y recuperación."],
  ["Google", "Inicio de sesión con Google y analítica (Google Analytics, con Google Tag Manager)."],
  ["Cloudflare", "DNS del dominio y reenvío de correo."],
  ["Servicios de notificaciones push de los navegadores (Google FCM, Mozilla, Apple, Microsoft)", "Reciben tu suscripción y el contenido de cada aviso para entregarlo a tu dispositivo, fuera de Panamá."],
];

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "Quién es el responsable y cómo contactarlo",
    body: (
      <>
        <p>
          El responsable del tratamiento de tus datos es <strong>MatchPa</strong>, un proyecto en beta hecho en
          Panamá. Esta política se rige por la Ley 81 de 2019 sobre protección de datos personales y el Decreto
          Ejecutivo 285 de 2021 que la reglamenta. La autoridad es la ANTAI.
        </p>
        <p>
          Para cualquier consulta o solicitud sobre tus datos escríbenos a{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: "datos",
    title: "Qué datos tratamos y para qué",
    body: (
      <>
        <p>Solo pedimos lo necesario para armar partidos. Esto es lo que guardamos:</p>
        <LegalTable head={DATA_HEAD} rows={DATA_ROWS} />
        <p>
          Tratamos tus datos porque los necesitas para usar MatchPa y porque aceptaste estos términos al crear tu
          cuenta. No vendemos tus datos ni los usamos para publicidad.
        </p>
      </>
    ),
  },
  {
    id: "whatsapp",
    title: "Tu WhatsApp",
    body: (
      <ul>
        <li>Se guarda cifrado.</li>
        <li>
          Si organizas un partido, lo ven los jugadores de ese partido (los que aceptaste o los que aceptaron tu
          invitación), y solo mientras esté abierto o completo. Cuando se cierra o vence, deja de mostrarse.
        </li>
        <li>
          <strong>Tu número no se comparte con el organizador</strong> de un partido al que pides unirte: el que se
          muestra es el del organizador a los jugadores aceptados, no al revés.
        </li>
        <li>No aparece en listas, notificaciones ni en las vistas públicas de un partido.</li>
        <li>No lo usamos para publicidad ni lo compartimos con terceros.</li>
      </ul>
    ),
  },
  {
    id: "proveedores",
    title: "Proveedores y transferencias fuera de Panamá",
    body: (
      <>
        <p>
          Para funcionar usamos servicios de terceros. Algunos guardan o procesan datos en servidores fuera de Panamá,
          así que tus datos pueden viajar al extranjero. Solo les damos lo necesario para su función.
        </p>
        <ul>
          {PROVIDERS.map(([name, role]) => (
            <li key={name}>
              <strong>{name}:</strong> {role}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "conservacion",
    title: "Cuánto tiempo guardamos tus datos",
    body: (
      <>
        <p>Guardamos tus datos mientras tengas la cuenta. Puedes eliminarla desde el final de tu perfil, escribiendo ELIMINAR. No se puede deshacer.</p>
        <p>Al eliminarla:</p>
        <ul>
          <li>
            Anonimizamos tu cuenta: tu nombre pasa a &quot;Jugador eliminado&quot; y borramos tu correo, contraseña,
            Google, foto, WhatsApp, categoría, subnivel y género.
          </li>
          <li>Borramos tu disponibilidad, suscripciones push, códigos de verificación y sugerencias de sucursal.</li>
          <li>Cerramos tus partidos futuros y cancelamos tus solicitudes pendientes. Dejas libres tus puestos en partidos de otros.</li>
          <li>Los partidos pasados se quedan como historial de los demás jugadores, con tu nombre como &quot;Jugador eliminado&quot;.</li>
          <li>Cerramos todas tus sesiones.</li>
        </ul>
        <p>
          Hay datos técnicos que se guardan aparte: tu dirección IP, que usamos de forma temporal para limitar
          intentos y frenar abusos, y los registros técnicos del servidor. Además, el proveedor de la base de datos
          hace copias de respaldo que se eliminan en su ciclo normal, así que el borrado de tu cuenta no es
          instantáneo en los respaldos.
        </p>
        <p>
          Conservamos la fecha y la versión de los términos que aceptaste, como prueba de tu consentimiento. Este
          registro no te identifica una vez anonimizada la cuenta.
        </p>
        <p>
          Si quieres eliminar tu cuenta sin aceptar unos términos nuevos, escríbenos a{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: "derechos",
    title: "Tus derechos (ARCO+P)",
    body: (
      <>
        <p>Tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> saber qué datos tuyos tenemos.</li>
          <li><strong>Rectificación:</strong> corregir datos incorrectos. Casi todos los cambias tú en tu perfil.</li>
          <li><strong>Cancelación:</strong> pedir que eliminemos tus datos.</li>
          <li><strong>Oposición:</strong> oponerte a un tratamiento.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en un formato que puedas llevarte.</li>
        </ul>
        <p>
          Para ejercerlos, escribe a <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> desde el correo de tu
          cuenta. Te respondemos en un máximo de <strong>10 días hábiles</strong>. Si no estás conforme, puedes acudir
          a la ANTAI.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies y analítica",
    body: (
      <>
        <p>
          Usamos una cookie de sesión para mantenerte dentro de tu cuenta. Es necesaria para que MatchPa funcione.
        </p>
        <p>
          También usamos Google Analytics, cargado con Google Tag Manager, para medir cómo se usa el sitio y mejorarlo.
          Registra visitas y acciones como publicar un partido o pedir unirte. No enviamos tu nombre, correo ni
          teléfono, pero sí la dirección de las páginas que visitas, que puede incluir el código de un partido.
          Google puede guardar cookies propias para esta medición.
        </p>
        <p>
          Puedes bloquear las cookies de analítica desde los ajustes de tu navegador o con un bloqueador de anuncios y
          MatchPa seguirá funcionando. La cookie de sesión es necesaria para iniciar sesión.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    title: "Menores de 18",
    body: (
      <p>
        MatchPa es para personas de 18 años o más. No creamos cuentas a sabiendas de menores. Si crees que un menor
        tiene una cuenta, escríbenos a <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> y la eliminamos.
      </p>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad",
    body: (
      <ul>
        <li>Tu contraseña se guarda hasheada y tu WhatsApp, cifrado.</li>
        <li>La conexión al sitio va protegida con HTTPS y la sesión usa una cookie que el navegador no deja leer a scripts.</li>
        <li>Limitamos los intentos de inicio de sesión y de verificación para frenar abusos.</li>
        <li>Si hubiera una brecha que te afecte, te avisamos a ti y a la autoridad en el plazo que exige la ley.</li>
      </ul>
    ),
  },
  {
    id: "cambios",
    title: "Cambios a esta política",
    body: (
      <p>
        Si cambiamos esta política o los <Link href="/terminos">Términos de uso</Link> de forma importante, publicamos
        una nueva versión con su fecha. Aceptas los Términos y esta Política al crear tu cuenta o la primera vez que
        entras después de un cambio.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Qué guardamos de ti, para qué lo usamos y cómo mandas tú. Sin letra chiquita."
      sections={SECTIONS}
    />
  );
}
