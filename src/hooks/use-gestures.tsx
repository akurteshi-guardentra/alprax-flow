
import { useState, useEffect } from 'react';

interface GestureState {
  startX: number;
  startY: number;
  isDragging: boolean;
}

export function useGestures(threshold = 50) {
  const [gesture, setGesture] = useState<string | null>(null);
  
  useEffect(() => {
    let gestureState: GestureState = {
      startX: 0,
      startY: 0,
      isDragging: false,
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      gestureState = {
        startX: touch.clientX,
        startY: touch.clientY,
        isDragging: true,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gestureState.isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - gestureState.startX;
      const deltaY = touch.clientY - gestureState.startY;
      
      if (Math.abs(deltaX) > threshold) {
        setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
        gestureState.isDragging = false;
      } else if (Math.abs(deltaY) > threshold) {
        setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
        gestureState.isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      gestureState.isDragging = false;
      setTimeout(() => setGesture(null), 300);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold]);

  return gesture;
}
