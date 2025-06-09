import React, { useRef, useEffect, useState, ReactNode, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useBrowserSupport } from '@/hooks/use-browser-support';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number, isVisible: boolean) => ReactNode;
  className?: string;
  emptyState?: ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  itemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  overscan = 5,
  renderItem,
  className = '',
  emptyState,
  onEndReached,
  endReachedThreshold = 300,
  itemKey = (_, index) => index
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: overscan * 2 });
  const { prefersReducedMotion } = useBrowserSupport();
  const isMobile = useIsMobile();
  
  // For infinite scrolling
  const { ref: endRef, inView: isEndVisible } = useInView({
    threshold: 0,
    rootMargin: `0px 0px ${endReachedThreshold}px 0px`,
  });
  
  // Performance optimization: throttle scroll handler
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Calculate the visible item range based on scroll position
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateVisibleRange = throttle(() => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );
      
      setVisibleRange({ start: startIndex, end: endIndex });
    }, 16); // ~60fps
    
    // Initial calculation
    updateVisibleRange();
    
    // Update on scroll
    const container = containerRef.current;
    container.addEventListener('scroll', updateVisibleRange);
    
    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateVisibleRange);
      }
    };
  }, [items.length, itemHeight, overscan, throttle]);
  
  // Call onEndReached when the end is visible
  useEffect(() => {
    if (isEndVisible && onEndReached) {
      onEndReached();
    }
  }, [isEndVisible, onEndReached]);
  
  // If there are no items, show the empty state
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  
  // Calculate total height of all items for correct scrollbar
  const totalHeight = items.length * itemHeight;
  
  // Only render items that are in the visible range
  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  
  // Apply optimizations for older browsers or reduced motion preference
  const shouldReduceEffects = prefersReducedMotion || isMobile;
  
  // Enhanced mobile rendering optimizations  // Define mobile optimization props with proper TypeScript types
  const mobileOptimizationProps: React.CSSProperties = isMobile ? {
    willChange: 'transform',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
  } : {};
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: '100%',
        ...mobileOptimizationProps
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, visibleIndex) => {
          const index = visibleRange.start + visibleIndex;
          const key = itemKey(item, index);
          
          // Apply fade-in effect only on initial render for better performance
          const isNew = index >= visibleRange.start && index <= visibleRange.end;
            return (
            <div
              key={key}
              className={isNew && !shouldReduceEffects ? 'fade-in' : ''}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
                transform: shouldReduceEffects ? 'none' : undefined,
                opacity: shouldReduceEffects ? 1 : undefined,
                transition: shouldReduceEffects ? 'none' : undefined,
              }}
            >
              {renderItem(item, index, true)}
            </div>
          );
        })}
        
        {/* Invisible element to detect when we're approaching the end */}
        <div
          ref={endRef}
          style={{
            position: 'absolute',
            bottom: endReachedThreshold,
            width: '100%',
            height: 1,
            visibility: 'hidden'
          }}
          aria-hidden="true"
        />      </div>
    </div>
  );
}
