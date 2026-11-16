export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-brand-teal underline underline-offset-4 dark:text-brand-lime"
    >
      {children}
    </a>
  );
}
