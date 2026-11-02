import { CONTACT_EMAIL } from "@/lib/config";

export function ContactLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("MatchPa beta")}`}
      className="inline-flex min-h-11 items-center font-semibold text-brand-teal underline underline-offset-4 dark:text-brand-lime"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
