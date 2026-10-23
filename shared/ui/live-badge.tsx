import type { HTMLAttributes } from "react";

import { colors, radii } from "../design-tokens/tokens";
import { focusVisible } from "../lib/a11y";

type LiveBadgeProps = HTMLAttributes<HTMLSpanElement>;

export function LiveBadge({ style, ...rest }: LiveBadgeProps) {
  return (
    <span
      style={{
        borderRadius: radii.liveBadge,
        background: colors.live,
        color: "#ffffff",
        padding: "1px 6px",
        fontSize: "11px",
        fontWeight: 700,
        display: "inline-block",
        ...style,
      }}
      className={focusVisible}
      {...rest}
    >
      LIVE
    </span>
  );
}
