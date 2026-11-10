import { cn } from "@/lib/utils";

interface PageTitleProps {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export function PageTitle({ children, hint, className }: PageTitleProps) {
  return (
    <div className="space-y-1">
      <h1 className={cn("font-heading text-3xl font-extrabold leading-tight sm:text-4xl", className)}>{children}</h1>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
