import { createElement } from "react";
import type { IconNode } from "lucide";

/** Lucide icon drawn from its raw nodes: lucide-react is client-only and can't render in an image route. */
export function OgIcon({ node, size, color }: { node: IconNode; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {node.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  );
}
