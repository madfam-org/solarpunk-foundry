import * as React from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * ActionMenu - Dropdown menu for row/item actions
 *
 * Requires these peer dependencies from your app's shadcn installation:
 * - @radix-ui/react-dropdown-menu
 * - lucide-react
 *
 * The component accepts primitives as props to avoid coupling to specific
 * shadcn versions. Import from your app:
 *
 * @example
 * import { ActionMenu } from '@madfam/ui';
 * import { Button } from '@/components/ui/button';
 * import {
 *   DropdownMenu,
 *   DropdownMenuContent,
 *   DropdownMenuItem,
 *   DropdownMenuTrigger,
 *   DropdownMenuGroup,
 *   DropdownMenuSeparator,
 * } from '@/components/ui/dropdown-menu';
 *
 * <ActionMenu
 *   actions={[{ label: 'Edit', onClick: () => {} }]}
 *   primitives={{ Button, DropdownMenu, DropdownMenuContent, ... }}
 * />
 */

/** Single action item in the menu */
export interface ActionItem {
  /** Display label for the action */
  label: string;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Visual variant - destructive shows in red */
  variant?: "default" | "destructive";
  /** Disable the action */
  disabled?: boolean;
  /** Hide the action conditionally */
  hidden?: boolean;
}

/** Group of actions with optional separator */
export interface ActionGroup {
  /** Actions in this group */
  items: ActionItem[];
  /** Group label (optional) */
  label?: string;
}

/** Dropdown menu primitives interface for dependency injection */
export interface DropdownPrimitives {
  DropdownMenu: React.ComponentType<{ children: React.ReactNode }>;
  DropdownMenuTrigger: React.ComponentType<{
    asChild?: boolean;
    children: React.ReactNode;
  }>;
  DropdownMenuContent: React.ComponentType<{
    align?: "start" | "center" | "end";
    className?: string;
    children: React.ReactNode;
  }>;
  DropdownMenuItem: React.ComponentType<{
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
  }>;
  DropdownMenuGroup?: React.ComponentType<{ children: React.ReactNode }>;
  DropdownMenuSeparator?: React.ComponentType<Record<string, unknown>>;
  Button: React.ComponentType<{
    variant?: string;
    size?: string;
    className?: string;
    children: React.ReactNode;
  }>;
}

export interface ActionMenuProps {
  /** Flat list of actions (mutually exclusive with groups) */
  actions?: ActionItem[];
  /** Grouped actions with separators (mutually exclusive with actions) */
  groups?: ActionGroup[];
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Dropdown alignment */
  align?: "start" | "center" | "end";
  /** Additional CSS classes for the trigger */
  className?: string;
  /** Screen reader label for trigger */
  srLabel?: string;
  /** Dropdown primitives from your app's shadcn installation */
  primitives: DropdownPrimitives;
}

/**
 * ActionMenu renders a dropdown menu for item/row actions.
 *
 * Supports two modes:
 * 1. Flat actions: Simple list of ActionItem[]
 * 2. Grouped actions: ActionGroup[] with separators between groups
 */
export function ActionMenu({
  actions,
  groups,
  trigger,
  align = "end",
  className,
  srLabel = "Open actions menu",
  primitives,
}: ActionMenuProps) {
  const {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    Button,
  } = primitives;

  // Filter hidden actions
  const visibleActions = actions?.filter((action) => !action.hidden) ?? [];
  const visibleGroups = groups?.map((group) => ({
    ...group,
    items: group.items.filter((action) => !action.hidden),
  }));

  // Render a single action item
  const renderActionItem = (action: ActionItem, index: number) => (
    <DropdownMenuItem
      key={`${action.label}-${index}`}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        action.variant === "destructive" &&
          "text-destructive focus:text-destructive"
      )}
    >
      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
      {action.label}
    </DropdownMenuItem>
  );

  // Default trigger button
  const defaultTrigger = (
    <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
      <span className="sr-only">{srLabel}</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[160px]">
        {/* Flat actions mode */}
        {visibleActions.length > 0 &&
          visibleActions.map((action, index) =>
            renderActionItem(action, index)
          )}

        {/* Grouped actions mode */}
        {visibleGroups?.map((group, groupIndex) => (
          <React.Fragment key={`group-${groupIndex}`}>
            {groupIndex > 0 && DropdownMenuSeparator && (
              <DropdownMenuSeparator />
            )}
            {DropdownMenuGroup ? (
              <DropdownMenuGroup>
                {group.items.map((action, index) =>
                  renderActionItem(action, index)
                )}
              </DropdownMenuGroup>
            ) : (
              group.items.map((action, index) =>
                renderActionItem(action, index)
              )
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ActionMenu;
