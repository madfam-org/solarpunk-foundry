/**
 * @madfam/ui
 * Shared UI components for the MADFAM ecosystem
 *
 * Design System: φ-based golden ratio proportions
 * Theme: Requires CSS custom properties for status colors
 */

// ============================================================================
// Core Utilities
// ============================================================================

export { cn, PHI, phiScale, phiSpacing, cssVars } from "./lib/utils";

// ============================================================================
// Components
// ============================================================================

// Button - Primary action button with φ-based design
export { Button, buttonVariants } from "./components/Button";
export type { ButtonProps } from "./components/Button";

// Card - Content container with glassmorphism
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
} from "./components/Card";
export type { CardProps } from "./components/Card";

// GlassPanel - Advanced glassmorphism container
export { GlassPanel, glassPanelVariants } from "./components/GlassPanel";
export type { GlassPanelProps } from "./components/GlassPanel";

// StatusBadge - Semantic status indicators
export { StatusBadge, statusBadgeVariants } from "./components/StatusBadge";
export type { StatusBadgeProps } from "./components/StatusBadge";

// ActionMenu - Dropdown action menus for rows/items
export { ActionMenu } from "./components/ActionMenu";
export type {
  ActionMenuProps,
  ActionItem,
  ActionGroup,
  DropdownPrimitives,
} from "./components/ActionMenu";

// PricingCalculator - Infrastructure cost calculator
export { PricingCalculator } from "./components/PricingCalculator";
export type { default as PricingCalculatorProps } from "./components/PricingCalculator";
