"use client";

import Link from "next/link";
import { BetaBadge } from "@/components/matchpa/beta-badge";
import { Logo } from "@/components/matchpa/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

/** Mobile first: the logo is centered. From md up it moves left and "Lobby" goes to the center. */
export function SiteHeader() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-brand-teal">
      <div className="mx-auto grid h-14 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="relative col-start-2 justify-self-center md:col-start-1 md:justify-self-start">
          <Logo />
          <BetaBadge className="absolute left-full top-1/2 ml-1.5 -translate-y-1/2" />
        </div>

        {user ? (
          <nav
            aria-label="Principal"
            className="hidden md:col-start-2 md:block"
          >
            <Link
              href="/lobby"
              className="text-sm font-semibold text-brand-ivory hover:text-brand-lime"
            >
              Lobby
            </Link>
          </nav>
        ) : null}

        <div className="col-start-3 justify-self-end">
          {loading || user ? null : (
            <Button asChild size="sm" className="font-bold">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
