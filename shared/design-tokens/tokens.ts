export const colors = {
  cta: "#ea580c",
  ctaHover: "#fb923c",
  link: "#c2410c",
  pressed: "#9a3412",
  darkest: "#7c2d12",
  live: "#eb0400",
} as const;

export const radii = {
  card: "4px",
  input: "6px",
  pill: "9000px",
  liveBadge: "2px",
} as const;

export type ColorToken = keyof typeof colors;
export type RadiusToken = keyof typeof radii;
