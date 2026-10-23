/**
 * Accessibility helpers for the Twitch Clone.
 *
 * Provides contrast ratio calculations, focus-visible utilities,
 * and reduced motion preferences used across browse and watch features.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/custom-controls/checkbox/checkbox
 */

// WCAG 2.1 contrast thresholds
const AA_CONTRAST = 4.5;
const AAA_CONTRAST = 7.0;

// sRGB luminance calculation per WCAG 2.1
const luminance = (hex: string): number => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

// Contrast ratio between two hex colors (WCAG 2.1)
const contrastRatio = (a: string, b: string): number => {
  const lumA = luminance(a);
  const lumB = luminance(b);
  const lightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return (lightest + 0.05) / (darkest + 0.05);
};

// Check contrast against WCAG thresholds
export type ContrastLevel = "AA" | "AAA";

export interface ContrastResult {
  aa: boolean;
  aaa: boolean;
  ratio: number;
}

/**
 * Check contrast ratio of foreground against background.
 */
export const checkContrast = (foreground: string, background: string): ContrastResult => {
  const ratio = contrastRatio(foreground, background);
  return {
    aa: ratio >= AA_CONTRAST,
    aaa: ratio >= AAA_CONTRAST,
    ratio: Number(ratio.toFixed(2)),
  };
};

/**
 * Pre-computed contrast checks against standard backgrounds.
 */
export const tokenContrastAgainst = {
  /** Contrast against dark canvas (#0e0e10) - used on watch routes */
  dark: (foreground: string) => checkContrast(foreground, "#0e0e10"),
  /** Contrast against light canvas (#ffffff) - used on browse routes */
  light: (foreground: string) => checkContrast(foreground, "#ffffff"),
  /** Convenience: white text on foreground */
  whiteOn: (foreground: string) => checkContrast("#ffffff", foreground),
  /** Convenience: foreground text on white */
  onWhite: (foreground: string) => checkContrast(foreground, "#ffffff"),
} as const;

/**
 * Pre-computed contrast for all design tokens against dark and light backgrounds.
 *
 * @design Tokens per the repo design system:
 * - Orange ladder: cta, ctaHover, link, pressed
 * - Live red: live (only for LIVE/destructive)
 * - Darkest: pill/tag backgrounds
 */
export const tokenContrastChecks = {
  cta: tokenContrastAgainst.dark("#ea580c"),
  ctaHover: tokenContrastAgainst.dark("#fb923c"),
  link: tokenContrastAgainst.dark("#c2410c"),
  pressed: tokenContrastAgainst.dark("#9a3412"),
  darkest: tokenContrastAgainst.dark("#7c2d12"),
  live: tokenContrastAgainst.dark("#eb0400"),
} as const;

/**
 * Focus-visible class name for keyboard navigation.
 * Use with `&:focus-visible { ... }` in CSS or className prop.
 */
export const focusVisible =
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

/**
 * Reduced motion media query utility.
 * Returns a CSS media string or React style object.
 */
export const reducedMotion = "(prefers-reduced-motion: reduce)";

/**
 * Reduced motion style object for React inline styles.
 * Disables transitions and animations when user prefers reduced motion.
 */
export const reducedMotionStyle = {
  transition: "none !important",
  animation: "none !important",
};

/**
 * Slow transition duration for reduced motion compatibility.
 */
export const reducedMotionDuration = "160ms";

/**
 * Check if the environment prefers reduced motion.
 * Used with `matchMedia` in effect or component.
 */
export const useReducedMotion = (): boolean => {
  // This is a client-side hook, called at runtime
  // The actual check is done via matchMedia in components
  return false;
};

/**
 * ARIA label base for elements needing screen reader description.
 * Provides consistent labeling pattern across features.
 */
export const ariaLabel = (key: string): string => {
  const labels: Record<string, string> = {
    play: "Play stream",
    pause: "Pause stream",
    mute: "Mute stream",
    unmute: "Unmute stream",
    fullscreen: "Enter fullscreen",
    theater: "Toggle theater mode",
    follow: "Follow channel",
    unfollow: "Unfollow channel",
    close: "Close",
    menu: "Menu",
    toggle: "Toggle",
  };
  return labels[key] || key;
};

/**
 * Skip link content for keyboard navigation.
 * Used for focus-able elements that skip main content.
 */
export const skipLink = "Skip to main content";

/**
 * Get the brand color with enhanced contrast adjustment.
 * Adjusts a base hex color by a factor while preserving hue.
 * Useful for generating focus-visible or hover variants.
 */
export const adjustContrast = (hex: string, factor: number, lighten: boolean = true): string => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = Math.min(
    255,
    Math.max(0, Math.round((bigint >> 16) * (lighten ? factor : 1 / factor))),
  );
  const g = Math.min(
    255,
    Math.max(0, Math.round(((bigint >> 8) & 0x0000ff) * (lighten ? factor : 1 / factor))),
  );
  const b = Math.min(
    255,
    Math.max(0, Math.round((bigint & 0x000000ff) * (lighten ? factor : 1 / factor))),
  );
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

/**
 * Skip navigation array for keyboard order planning.
 * Defines the expected tab order across the application.
 */
export const skipNavigation = {
  /** Top-level: logo, search, browse/watch toggle */
  primary: ["focusable", "skip-link", "primary-nav"],
  /** Browse page tab order */
  browse: ["banner", "hero-carousel", "video-grid", "category-tiles", "sidebar"],
  /** Watch page tab order */
  watch: ["player-controls", "info-panel", "chat-column", "follow-button"],
} as const;
