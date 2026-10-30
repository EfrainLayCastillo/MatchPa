"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LoadFailedProps {
  onRetry: () => Promise<unknown>;
  message?: string;
}

export function LoadFailed({ onRetry, message = "No pudimos cargar esto. Puede que el servidor esté despertando." }: LoadFailedProps) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    await onRetry().finally(() => setRetrying(false));
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" className="h-11" onClick={retry} disabled={retrying}>
        {retrying ? "Reintentando…" : "Reintentar"}
      </Button>
    </div>
  );
}
