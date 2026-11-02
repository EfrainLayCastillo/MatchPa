import { UPCOMING_FEATURES } from "@/lib/upcoming";

export function UpcomingFeatures() {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {UPCOMING_FEATURES.map((feature) => (
        <li key={feature.title} className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
          <h3 className="font-heading text-lg font-bold">{feature.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
          {feature.tags ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {feature.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-brand-turquoise/20 px-2.5 py-0.5 text-xs font-semibold text-brand-teal dark:text-brand-turquoise"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
