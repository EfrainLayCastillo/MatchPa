import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 pb-16 pt-10 text-center">
      <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">ey Pa, te perdiste</p>
      <h1 className="font-heading text-5xl font-extrabold leading-[0.95]">Esta cancha no existe</h1>
      <p className="text-muted-foreground">El link está mal escrito o la página ya no está. Vuelve al lobby y busca tu partido.</p>
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-12 text-base font-bold">
          <Link href="/lobby">Ir al lobby</Link>
        </Button>
        <Button asChild variant="ghost" className="h-11">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
