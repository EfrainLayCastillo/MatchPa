import Link from "next/link";
import { ContactLink } from "./contact-link";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/lobby", label: "Lobby" },
  { href: "/beta", label: "Beta" },
];

/** Hidden while a fixed bottom bar is on screen; it would cover the footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border [body:has([data-fixed-bottom-bar])_&]:hidden">
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
        <div className="space-y-1 sm:text-right">
          <p>
            ¿Dudas o ideas? <ContactLink />
          </p>
          <p>
            © Match
            <span className="font-script text-base text-brand-teal dark:text-brand-lime">
              Pa
            </span>{" "}
            · Hecho en Panamá para los que no se pierden un partido.
          </p>
        </div>
      </div>
    </footer>
  );
}
