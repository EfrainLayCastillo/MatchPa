import type { ReactNode } from "react";
import { LEGAL_UPDATED_AT } from "@/lib/legal";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 pb-20 pt-10 sm:pt-16">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl font-extrabold leading-[0.95] sm:text-5xl">{title}</h1>
        <p className="text-sm font-semibold text-brand-teal dark:text-brand-lime">
          Última actualización: {LEGAL_UPDATED_AT}
        </p>
        <p className="text-lg text-muted-foreground">{intro}</p>
      </header>

      <nav aria-label="Contenido" className="rounded-2xl border border-border bg-card p-4">
        <ol className="space-y-1 text-sm">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime"
              >
                <span className="tabular-nums text-muted-foreground">{index + 1}.</span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section, index) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-20 space-y-3">
          <h2 id={`${section.id}-title`} className="font-heading text-2xl font-bold">
            {index + 1}. {section.title}
          </h2>
          <div className="space-y-3 text-muted-foreground [&_a]:font-semibold [&_a]:text-brand-teal [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-brand-lime [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {section.body}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LegalTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="space-y-3 md:space-y-0">
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border text-foreground">
            {head.map((cell) => (
              <th key={cell} scope="col" className="py-2 pr-3 font-semibold">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border align-top">
              {row.map((cell, i) => (
                <td key={i} className={i === 0 ? "py-2 pr-3 font-semibold text-foreground" : "py-2 pr-3"}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="!list-none !space-y-3 !pl-0 md:hidden">
        {rows.map((row, index) => (
          <li key={index} className="space-y-1 rounded-2xl border border-border bg-card p-4 text-sm !pl-4">
            <p className="font-semibold text-foreground">{row[0]}</p>
            {row.slice(1).map((cell, i) => (
              <p key={i}>
                <span className="font-semibold text-foreground">{head[i + 1]}: </span>
                {cell}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
