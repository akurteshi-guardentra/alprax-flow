import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Custom className for the indicator */
  indicatorClassName?: string;
  /** Shows label with percentage inside the progress bar (only visible when bar is wide enough) */
  showValueLabel?: boolean;
  /** Visual variant of the progress bar */
  variant?: "default" | "striped" | "indeterminate";
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
  // Get system preference for reduced motion
  const prefersReducedMotion = 
    typeof window !== "undefined" 
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
      : false;
  
  // Disable animations if device is low-end or user prefers reduced motion
  const shouldAnimate = !isLowEndDevice && !prefersReducedMotion;

  // Generate unique ID for ARIA labelling
  const id = React.useId();
  
  // Use state to animate value changes
  const [displayValue, setDisplayValue] = React.useState(value);
  
  React.useEffect(() => {
    // Only animate if we should animate and the value has changed
    if (shouldAnimate) {
      // If value changes significantly, animate it
      if (Math.abs(displayValue - value) > 3) {
        const timeout = setTimeout(() => {
          setDisplayValue(value);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // For small changes, update immediately
        setDisplayValue(value);
      }
    } else {
      // No animation needed, set immediately
      setDisplayValue(value);
    }
  }, [value, shouldAnimate, displayValue]);
  
  // For striped variant
  const stripedClass = variant === "striped" 
    ? "bg-stripes" 
    : "";
  
  // Animation variants for indeterminate state
  const indeterminateAnimation = variant === "indeterminate" && shouldAnimate
    ? { 
        x: ["0%", "100%", "0%"], 
        transition: { 
          repeat: Infinity, 
          duration: isLowEndDevice ? 3 : 2,
          ease: "easeInOut" 
        } 
      }
    : {};
  
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
      
      {variant === "indeterminate" ? (
        <motion.div
          className={cn(
            "h-full w-1/3 flex-1 bg-primary rounded-full",
            stripedClass,
            indicatorClassName
          )}
          animate={indeterminateAnimation}
        />
      ) : (
        <motion.div
          className={cn(
            "h-full w-full flex-1 bg-primary origin-left items-center flex px-2",
            stripedClass,
            indicatorClassName,
            value >= 90 ? "justify-end" : "justify-start"
          )}          style={{
            transform: `translateX(-${100 - (value || 0)}%)`
          }}
          transition={{ 
            duration: shouldAnimate ? 0.4 : 0,
            ease: "easeOut"
          }}
        >
          {showValueLabel && isWideEnough && (
            <span className="text-xs font-medium text-primary-foreground px-1 truncate">
              {value}%
            </span>
          )}
        </motion.div>
      )}
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }
