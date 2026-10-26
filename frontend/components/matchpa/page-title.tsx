export function PageTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{children}</h1>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
