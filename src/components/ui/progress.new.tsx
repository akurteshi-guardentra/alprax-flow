import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Custom className for the indicator */
  indicatorClassName?: string;
  /** Shows label with percentage inside the progress bar (only visible when bar is wide enough) */
  showValueLabel?: boolean;
  /** Visual variant of the progress bar */
  variant?: "default" | "striped";
  /** Label for accessibility */
  label?: string;
  /** Optimization for low-end devices reduces animation complexity */
  isLowEndDevice?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ExtendedProgressProps
>(({ 
  className, 
  value = 0, 
  indicatorClassName, 
  showValueLabel = false,
  variant = "default",
  label,
  isLowEndDevice = false,
  ...props 
}, ref) => {
  // Generate unique ID for ARIA labelling
  const id = React.useId();
  
  // For striped variant
  const stripedClass = variant === "striped" 
    ? "bg-stripes" 
    : "";
  
  // Calculate if the progress bar is wide enough to display the label
  const isWideEnough = value > 10;
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      aria-describedby={label ? `${id}-desc` : undefined}
    >
      {label && (
        <span id={`${id}-desc`} className="sr-only">
          {label}: {value}%
        </span>
      )}
      
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary origin-left flex items-center px-2 transition-transform duration-300",
          stripedClass,
          indicatorClassName,
          value >= 90 ? "justify-end" : "justify-start"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {showValueLabel && isWideEnough && (
          <span className="text-xs font-medium text-primary-foreground px-1 truncate">
            {value}%
          </span>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }
