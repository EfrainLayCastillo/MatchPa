"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";
import { Logo } from "./logo";

export function SiteHeader() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Logo />
        {loading ? null : user ? (
          <Link
            href="/perfil"
            aria-label="Mi perfil"
            className="flex size-9 items-center justify-center rounded-full bg-brand-teal text-sm font-bold text-brand-lime"
          >
            {user.fullName.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
