import type { IconNode } from "lucide";
import { BRAND } from "@/lib/brand-colors";
import { OgIcon } from "./icon";

interface PillProps {
  icon?: IconNode;
  background?: string;
  scale?: number;
  children: string;
}

/** Same look as the app's IconBadge, sized for generated images. */
export function OgPill({ icon, background = BRAND.secondary, scale = 1, children }: PillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12 * scale,
        padding: `${16 * scale}px ${28 * scale}px`,
        borderRadius: 999,
        background,
        color: BRAND.teal,
        fontSize: 36 * scale,
        fontWeight: 800,
      }}
    >
      {icon ? <OgIcon node={icon} size={36 * scale} color={BRAND.teal} /> : null}
      {children}
    </div>
  );
}

/** Photo with the brand tint used on the match cards. */
export function OgPhoto({ src, width, height }: { src: string; width: number; height: number }) {
  return (
    <div style={{ display: "flex", position: "relative", width, height }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={src} alt="" width={width} height={height} style={{ objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          display: "flex",
          background: `linear-gradient(135deg, ${BRAND.teal}33 0%, transparent 50%, ${BRAND.lime}26 100%)`,
        }}
      />
    </div>
  );
}
