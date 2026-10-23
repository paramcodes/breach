import type { ButtonHTMLAttributes } from "react";

import { colors, radii } from "../design-tokens/tokens";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", style, ...rest }: ButtonProps) {
  const variantStyle =
    variant === "primary"
      ? { background: colors.cta, color: "#ffffff" }
      : { background: "transparent", color: colors.cta, border: `1px solid ${colors.cta}` };

  return (
    <button
      style={{
        borderRadius: radii.input,
        padding: "8px 16px",
        border: "none",
        cursor: "pointer",
        ...variantStyle,
        ...style,
      }}
      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      {...rest}
    />
  );
}
