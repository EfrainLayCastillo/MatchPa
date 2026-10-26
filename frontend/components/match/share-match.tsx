"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/config";

interface ShareMatchProps {
  code: string;
  summary: string;
}

export function ShareMatch({ code, summary }: ShareMatchProps) {
  const url = `${SITE_URL}/partidos/${code}`;
  const text = `${summary}\n${url}`;
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  async function share() {
    await navigator.share({ title: "Partido de pádel en MatchPa", text: summary, url }).catch(() => {});
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="font-heading text-lg font-bold">Comparte el link</p>
        <p className="break-all text-sm text-muted-foreground">{url}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {canNativeShare ? (
          <Button onClick={share}>Compartir</Button>
        ) : null}
        <Button variant={canNativeShare ? "outline" : "default"} onClick={copy}>
          {copied ? "Link copiado" : "Copiar link"}
        </Button>
        <Button asChild variant="outline">
          <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
