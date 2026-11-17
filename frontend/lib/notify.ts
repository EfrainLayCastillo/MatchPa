import { toast } from "sonner";
import { ApiError } from "./errors";

const ANDROID_HEADS_UP_TIP_MS = 12_000;

/** Android often ships the site's notification channel with "Pop on screen" off, so pushes land silently in the tray. */
export function suggestAndroidHeadsUp() {
  toast.info("Notificaciones activadas", {
    description:
      `Para verlas arriba de la pantalla, activa "Mostrar en pantalla" en Ajustes → Apps → Chrome → Notificaciones → ${window.location.hostname}.`,
    duration: ANDROID_HEADS_UP_TIP_MS,
  });
}

export function notifyError(err: unknown, fallback = "Algo salió mal, intenta de nuevo") {
  toast.error(err instanceof ApiError ? err.message : fallback);
}
