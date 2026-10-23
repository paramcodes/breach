import type { InputHTMLAttributes } from "react";

import { radii } from "../design-tokens/tokens";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ style, ...rest }: InputProps) {
  return (
    <input
      style={{
        borderRadius: radii.input,
        border: "1px solid #d4d4d8",
        padding: "8px 12px",
        ...style,
      }}
      {...rest}
    />
  );
}
