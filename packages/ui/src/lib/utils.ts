import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Golden Ratio constant (φ)
 * Used throughout the design system for harmonious proportions
 */
export const PHI = 1.618033988749895;

/**
 * Generate golden ratio based spacing
 * @param base - Base size in pixels
 * @param steps - Number of phi multiplications (negative for divisions)
 */
export function phiScale(base: number, steps: number): number {
  return base * Math.pow(PHI, steps);
}

/**
 * Generate phi-based spacing object for Tailwind config
 * @param base - Base size in pixels (default: 4)
 * @param steps - Number of steps to generate (default: 8)
 */
export function phiSpacing(base = 4, steps = 8): Record<string, string> {
  const spacing: Record<string, string> = {};
  for (let i = -2; i <= steps; i++) {
    const value = base * Math.pow(PHI, i);
    spacing[`phi-${i + 2}`] = `${value.toFixed(3)}px`;
  }
  return spacing;
}

/**
 * CSS custom property names for the design system
 */
export const cssVars = {
  // Timing
  dur1: "--dur-1",
  dur2: "--dur-2",
  dur3: "--dur-3",
  dur4: "--dur-4",

  // Easing
  easeStandard: "--ease-standard",
  easeDecelerate: "--ease-decelerate",
  easeAccelerate: "--ease-accelerate",

  // Shadows (amber glow)
  shadowAmber1: "--shadow-amber-1",
  shadowAmber2: "--shadow-amber-2",
  shadowAmber3: "--shadow-amber-3",
} as const;
