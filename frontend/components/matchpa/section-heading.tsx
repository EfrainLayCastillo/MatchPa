interface SectionHeadingProps {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}

export function SectionHeading({ children, trailing }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
      <span aria-hidden className="h-px flex-1 bg-border" />
      {trailing}
    </div>
  );
}
