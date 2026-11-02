import { cn } from "@/lib/utils";

interface Step {
  title: string;
  text: string;
}

export function StepCards({ steps, heading: Heading, className }: { steps: Step[]; heading: "h2" | "h3"; className?: string }) {
  return (
    <ol className={cn("grid gap-4", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
          <p className="font-script text-3xl text-brand-teal dark:text-brand-lime">{index + 1}</p>
          <Heading className="font-heading text-xl font-bold">{step.title}</Heading>
          <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
