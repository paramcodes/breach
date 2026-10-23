import type { HTMLAttributes } from "react";

import { colors, radii } from "../design-tokens/tokens";

type TagPillProps = HTMLAttributes<HTMLSpanElement>;

export function TagPill({ style, ...rest }: TagPillProps) {
  return (
    <span
      style={{
        borderRadius: radii.pill,
        background: colors.darkest,
        color: "#ffffff",
        padding: "2px 10px",
        fontSize: "12px",
        display: "inline-block",
        ...style,
      }}
      {...rest}
    />
  );
}
