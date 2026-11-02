"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/lobby", label: "Lobby" },
  { href: "/beta", label: "Beta" },
];

/** Hidden in the lobby: its fixed "Estoy disponible" bar would cover it. */
export function SiteFooter() {
  if (usePathname() === "/lobby") return null;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Pie de página" className="-ml-2 flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-2 font-semibold hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p>
          © Match
          <span className="font-script text-base text-brand-teal dark:text-brand-lime">
            Pa
          </span>{" "}
          · Hecho en Panamá para los que no se pierden un partido.
        </p>
      </div>
    </footer>
  );
}
