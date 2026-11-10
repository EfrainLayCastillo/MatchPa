import {
  BadgeCheckIcon,
  MarsIcon,
  SignalHighIcon,
  SignalLowIcon,
  TrophyIcon,
  VenusIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_TIER_LABELS,
  GENDER_LABELS,
  shortCategory,
} from "@/lib/format";
import type { Category, CategoryTier, Gender } from "@/lib/types";

export function InitialAvatar({
  name,
  verified = false,
}: {
  name: string;
  verified?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-brand-teal font-heading text-xl font-extrabold text-brand-lime"
      >
        {name.charAt(0).toUpperCase()}
      </span>
      {verified ? (
        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-card ring-2 ring-card">
          <BadgeCheckIcon
            aria-hidden
            className="size-5 fill-brand-turquoise text-card"
          />
          <span className="sr-only">Cuenta verificada</span>
        </span>
      ) : null}
    </span>
  );
}

const GENDER_LETTERS: Record<Gender, string> = { male: "M", female: "F" };
const GENDER_ICONS: Record<Gender, LucideIcon> = {
  male: MarsIcon,
  female: VenusIcon,
};

const TIER_ICONS: Record<CategoryTier, LucideIcon> = {
  high: SignalHighIcon,
  entry: SignalLowIcon,
};

interface LevelProps {
  category: Category | null;
  tier: CategoryTier | null;
  gender: Gender | null;
}

export function LevelBadges({ category, tier, gender }: LevelProps) {
  if (category === null && gender === null) return null;
  return (
    <span className="flex flex-wrap items-center gap-1">
      <GenderBadge gender={gender} />
      <CategoryBadge category={category} />
      {category !== null ? <TierBadge tier={tier} /> : null}
    </span>
  );
}

export function GenderBadge({ gender }: { gender: Gender | null }) {
  if (!gender) return null;
  const GenderIcon = GENDER_ICONS[gender];
  return (
    <Badge variant="outline" aria-label={GENDER_LABELS[gender]}>
      <GenderIcon data-icon="inline-start" />
      {GENDER_LETTERS[gender]}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: Category | null }) {
  if (category === null) return null;
  return (
    <Badge
      variant="secondary"
      aria-label={`Categoría ${shortCategory(category)}`}
    >
      <TrophyIcon data-icon="inline-start" />
      {shortCategory(category)}
    </Badge>
  );
}

export function TierBadge({ tier }: { tier: CategoryTier | null }) {
  if (!tier) return null;
  const TierIcon = TIER_ICONS[tier];
  return (
    <Badge
      variant="outline"
      aria-label={`Subnivel ${CATEGORY_TIER_LABELS[tier]}`}
    >
      <TierIcon data-icon="inline-start" />
      {CATEGORY_TIER_LABELS[tier]}
    </Badge>
  );
}

interface PlayerSummaryProps extends LevelProps {
  name: string;
  verified?: boolean;
  caption?: React.ReactNode;
  extraBadges?: React.ReactNode;
  action?: React.ReactNode;
}

/** Avatar, name with gender and category, then tier and any extra badges. */
export function PlayerSummary({
  name,
  verified,
  gender,
  category,
  tier,
  caption,
  extraBadges,
  action,
}: PlayerSummaryProps) {
  const hasSecondRow = tier !== null || extraBadges !== undefined;
  return (
    <div className="flex items-center gap-3">
      <InitialAvatar name={name} verified={verified} />
      <div className="min-w-0 flex-1 space-y-1">
        {caption}
        <div className="flex items-center gap-1.5">
          <p className="min-w-0 truncate font-heading text-base font-bold leading-tight">
            {name}
          </p>
          <span className="flex shrink-0 gap-1">
            <GenderBadge gender={gender} />
            <CategoryBadge category={category} />
          </span>
        </div>
        {hasSecondRow ? (
          <div className="flex flex-wrap gap-1">
            <TierBadge tier={tier} />
            {extraBadges}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
