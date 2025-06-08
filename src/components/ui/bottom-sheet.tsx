
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { motion, AnimatePresence, PanInfo, HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticFeedback } from "@/lib/haptics";

// Create a custom hook for bottom sheet state
export function useBottomSheet() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);
  
  return {
    isOpen,
    open,
    close
  };
}

const bottomSheetVariants = cva(
  "fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700 rounded-t-2xl shadow-xl",
  {
    variants: {
      size: {
        default: "max-h-[85%]",
        sm: "max-h-[35%]",
        lg: "max-h-[95%]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Define drag-related motion event handlers to exclude from props
type MotionDragProps = 
  'onDrag' | 
  'onDragStart' | 
  'onDragEnd' | 
  'onDirectionLock' | 
  'onDragTransitionEnd';

interface BottomSheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, MotionDragProps> {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[];
  initialSnapPoint?: number;
  title?: string;
  size?: "default" | "sm" | "lg";
  showCloseButton?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  snapPoints = [90],
  initialSnapPoint = 0,
  title,
  children,
  size = "default",
  showCloseButton = true,
  className,
  ...props
}: BottomSheetProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  // Handle snap point percentage calculations
  const currentSnapPoint = snapPoints?.[initialSnapPoint] ?? 50;
  
  // Handle sheet close
  const handleClose = () => {
    hapticFeedback("light");
    onClose();
  };
  
  // Properly type the handleDragEnd function for Framer Motion
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y < -50) {
      handleClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ 
              y: `${100 - currentSnapPoint}%`,
              transition: { type: "spring", damping: 25, stiffness: 300 }
            }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(bottomSheetVariants({ size }), className)}
            {...props as unknown as Omit<HTMLMotionProps<"div">, MotionDragProps>}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="h-1.5 w-12 rounded-full bg-slate-600" />
            </div>
            
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pb-4">
                {title && (
                  <h3 className="text-lg font-medium text-white">{title}</h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="rounded-full p-1.5 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-300" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="px-6 pb-8 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
