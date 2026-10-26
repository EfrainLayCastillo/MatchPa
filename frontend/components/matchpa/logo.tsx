import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline font-heading text-2xl font-extrabold ${className}`}>
      Match
      <span className="font-script -ml-0.5 text-[1.35em] font-normal text-brand-lime">Pa</span>
    </Link>
  );
}
