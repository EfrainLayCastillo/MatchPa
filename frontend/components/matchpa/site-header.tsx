"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/matchpa/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

/**
 * Mobile first: the logo is centered and the menu is a burger. From md up the logo moves left,
 * "Lobby" goes to the center and the menu becomes the initial-letter avatar.
 */
export function SiteHeader() {
  const { user, loading, setUser } = useSession();
  const router = useRouter();

  async function logout() {
    await api.logout().catch(() => {});
    setUser(null);
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 bg-brand-teal">
      <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="col-start-2 justify-self-center md:col-start-1 md:justify-self-start">
          <Logo />
        </div>

        {user ? (
          <nav aria-label="Principal" className="hidden md:col-start-2 md:block">
            <Link href="/lobby" className="text-sm font-semibold text-brand-ivory hover:text-brand-lime">
              Lobby
            </Link>
          </nav>
        ) : null}

        <div className="col-start-3 justify-self-end">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Menú de usuario"
                className="flex size-9 pointer-coarse:size-11 items-center justify-center rounded-full bg-brand-ivory text-brand-teal outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              >
                <Menu className="size-5 md:hidden" aria-hidden />
                <span className="hidden text-sm font-bold md:block">{user.fullName.charAt(0).toUpperCase()}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="truncate">{user.fullName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/lobby">Lobby</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mis-partidas">Mis partidas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/perfil">Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="font-bold">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
