import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * StatusBadge - Semantic status indicator component
 *
 * Uses CSS custom properties for theming:
 * - --status-success / --status-success-foreground / --status-success-muted
 * - --status-warning / --status-warning-foreground / --status-warning-muted
 * - --status-error / --status-error-foreground / --status-error-muted
 * - --status-info / --status-info-foreground / --status-info-muted
 *
 * @example
 * <StatusBadge status="success">Active</StatusBadge>
 * <StatusBadge status="error" appearance="muted">Failed</StatusBadge>
 */

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        success: "",
        warning: "",
        error: "",
        info: "",
        neutral: "",
      },
      appearance: {
        solid: "",
        muted: "",
      },
    },
    compoundVariants: [
      // Success variants
      {
        status: "success",
        appearance: "solid",
        className:
          "border-transparent bg-status-success text-status-success-foreground",
      },
      {
        status: "success",
        appearance: "muted",
        className:
          "border-status-success/30 bg-status-success-muted text-status-success",
      },
      // Warning variants
      {
        status: "warning",
        appearance: "solid",
        className:
          "border-transparent bg-status-warning text-status-warning-foreground",
      },
      {
        status: "warning",
        appearance: "muted",
        className:
          "border-status-warning/30 bg-status-warning-muted text-status-warning",
      },
      // Error variants
      {
        status: "error",
        appearance: "solid",
        className:
          "border-transparent bg-status-error text-status-error-foreground",
      },
      {
        status: "error",
        appearance: "muted",
        className:
          "border-status-error/30 bg-status-error-muted text-status-error",
      },
      // Info variants
      {
        status: "info",
        appearance: "solid",
        className:
          "border-transparent bg-status-info text-status-info-foreground",
      },
      {
        status: "info",
        appearance: "muted",
        className:
          "border-status-info/30 bg-status-info-muted text-status-info",
      },
      // Neutral variants
      {
        status: "neutral",
        appearance: "solid",
        className: "border-transparent bg-secondary text-secondary-foreground",
      },
      {
        status: "neutral",
        appearance: "muted",
        className: "border-border bg-muted text-muted-foreground",
      },
    ],
    defaultVariants: {
      status: "neutral",
      appearance: "solid",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Visual status indicator */
  status?: "success" | "warning" | "error" | "info" | "neutral";
  /** Solid or muted appearance */
  appearance?: "solid" | "muted";
}

/**
 * StatusBadge displays a semantic status indicator
 *
 * Requires status color CSS variables to be defined in your theme:
 * ```css
 * :root {
 *   --status-success: 142.1 76.2% 36.3%;
 *   --status-success-foreground: 355.7 100% 97.3%;
 *   --status-success-muted: 138.5 76.5% 96.7%;
 *   // ... etc for warning, error, info
 * }
 * ```
 */
export function StatusBadge({
  className,
  status,
  appearance,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status, appearance }), className)}
      {...props}
    />
  );
}

export { statusBadgeVariants };
export default StatusBadge;
