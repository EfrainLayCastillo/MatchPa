import { toast } from "sonner";
import { ApiError } from "./errors";

export function notifyError(err: unknown, fallback = "Algo salió mal, intenta de nuevo") {
  toast.error(err instanceof ApiError ? err.message : fallback);
}
