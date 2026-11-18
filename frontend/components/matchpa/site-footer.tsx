import Link from "next/link";
import { ContactLink } from "./contact-link";
import { INSTAGRAM_URL } from "@/lib/config";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/lobby", label: "Lobby" },
  { href: "/beta", label: "Beta" },
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
];

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
        <p className="sm:text-right">
          ¿Dudas o ideas? <ContactLink /> · Síguenos en{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-teal underline underline-offset-4 dark:text-brand-lime"
          >
            <InstagramIcon />
            Instagram
          </a>
        </p>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-7xl px-4 py-3 text-center text-xs text-muted-foreground">
          © Match
          <span className="font-script text-sm text-brand-teal dark:text-brand-lime">
            Pa
          </span>{" "}
          · Hecho en Panamá para los que no se pierden un partido.
        </p>
      </div>
    </footer>
  );
}
