import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { hapticFeedback } from '@/lib/haptics';
import { Delete, Star, StarOff, Info } from 'lucide-react';

interface SwipeableTransactionItemProps {
  children: React.ReactNode;
  onFavorite?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
  isFavorited?: boolean;
  disableLeftSwipe?: boolean;
  disableRightSwipe?: boolean;
  onSelect: () => void;
}

export const SwipeableTransactionItem = ({
  children,
  onFavorite,
  onDelete,
  onInfo,
  isFavorited = false,
  disableLeftSwipe = false,
  disableRightSwipe = false,
  onSelect,
}: SwipeableTransactionItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<'idle' | 'dragging' | 'left' | 'right'>('idle');
  const dragThreshold = 80; // px threshold to trigger action
  const maxDrag = 100; // max px allowed to drag

  // Reset the position when action is completed or canceled
  const resetPosition = () => {
    setDragState('idle');
  };

  // Handle drag events with framer-motion
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetX = info.offset.x;
    
    // Right swipe (favorite action)
    if (offsetX > dragThreshold && !disableRightSwipe) {
      setDragState('right');
      hapticFeedback('medium');
      
      // Wait a bit for animation and then trigger the action
      setTimeout(() => {
        if (onFavorite) onFavorite();
        resetPosition();
      }, 300);
    }
    // Left swipe (delete/info action)
    else if (offsetX < -dragThreshold && !disableLeftSwipe) {
      setDragState('left');
      hapticFeedback('medium');
      
      // Wait a bit for animation and then trigger the action
      setTimeout(() => {
        if (onDelete) onDelete();
        resetPosition();
      }, 300);
    }
    // Not enough distance to trigger action
    else {
      resetPosition();
    }
  };

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Action buttons that appear behind the item */}
      <div className="absolute inset-0 flex items-stretch">
        {/* Right side action (left swipe reveals) */}
        <div className="flex items-center justify-center bg-red-500 text-white flex-1 px-4">
          <div className="flex items-center">
            <Delete size={20} />
            <span className="ml-2 font-medium">Delete</span>
          </div>
        </div>
        
        {/* Left side action (right swipe reveals) */}
        <div className="flex items-center justify-center bg-amber-500 text-white flex-1 px-4">
          <div className="flex items-center">
            {isFavorited ? (
              <>
                <StarOff size={20} />
                <span className="ml-2 font-medium">Unfavorite</span>
              </>
            ) : (
              <>
                <Star size={20} />
                <span className="ml-2 font-medium">Favorite</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Draggable content */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: disableLeftSwipe ? 0 : -maxDrag, right: disableRightSwipe ? 0 : maxDrag }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={{
          x: dragState === 'idle' ? 0 : dragState === 'left' ? -maxDrag : maxDrag,
        }}
        transition={{ 
          type: "spring", 
          damping: 20,
          stiffness: 300
        }}
        onClick={() => {
          // Only trigger the click if we're not dragging
          if (dragState === 'idle') {
            onSelect();
          }
        }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};
