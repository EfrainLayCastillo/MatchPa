import { EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NamesHiddenCard({ code }: { code: string }) {
  return (
    <Card className="flex flex-col gap-3 border-dashed px-4 py-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal text-brand-lime"
        >
          <EyeOffIcon className="size-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="font-heading text-base font-bold leading-tight">¿Quieres saber quién juega?</p>
          <p className="text-sm text-muted-foreground">Entra para ver los nombres de los jugadores.</p>
        </div>
      </div>
      <Button asChild className="h-11 w-full font-semibold sm:w-auto">
        <Link href={`/login?next=/partidos/${code}`}>Entrar</Link>
      </Button>
    </Card>
  );
}
