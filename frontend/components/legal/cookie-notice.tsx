"use client";

import { LegalLink } from "@/components/legal/legal-link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "matchpa:cookie-notice";

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {}
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists on the client
    setVisible(!wasDismissed());
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg [body:has([data-fixed-bottom-bar])_&]:bottom-24"
    >
      <p className="flex-1 text-sm">
        Usamos Google Analytics para medir el uso.{" "}
        <LegalLink href="/privacidad#cookies">Más info</LegalLink>
      </p>
      <Button
        size="lg"
        className="h-11 font-bold"
        onClick={() => {
          rememberDismissal();
          setVisible(false);
        }}
      >
        Entendido
      </Button>
    </div>
  );
}
