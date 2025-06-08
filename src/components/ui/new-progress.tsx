import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Custom className for the indicator */
  indicatorClassName?: string;
  /** Label for accessibility */
  label?: string;
  /** Visual variant of the progress bar */
  variant?: "default" | "striped";
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
  label,
  variant = "default",
  isLowEndDevice = false,
  ...props 
}, ref) => {
  // Generate unique ID for ARIA labelling
  const id = React.useId();
  
  // For striped variant
  const stripedClass = variant === "striped" ? "bg-stripes" : "";
  
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
          "h-full w-full flex-1 bg-primary transition-all",
          stripedClass,
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }
