import { useCallback } from 'react';
import { hapticFeedback } from '@/lib/haptics';

interface HapticPattern {
  duration: number;
  intensity?: number;
}

interface AdvancedHapticOptions {
  pattern?: HapticPattern[];
  fallbackType?: 'light' | 'medium' | 'heavy';
}

export function useAdvancedHaptics() {
  const isVibrationSupported = useCallback(() => {
    return 'vibrate' in navigator;
  }, []);

  const vibratePattern = useCallback((pattern: number[] | number) => {
    if (!isVibrationSupported()) {
      console.log('Vibration not supported');
      return false;
    }

    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error('Vibration failed:', error);
      return false;
    }
  }, [isVibrationSupported]);

  const playCustomPattern = useCallback((options: AdvancedHapticOptions = {}) => {
    const { pattern = [], fallbackType = 'medium' } = options;

    if (pattern.length > 0 && isVibrationSupported()) {
      // Convert pattern to vibration format
      const vibrationPattern = pattern.flatMap((p, index) => [
        p.duration,
        index < pattern.length - 1 ? 100 : 0 // 100ms pause between patterns
      ]).slice(0, -1); // Remove last pause

      return vibratePattern(vibrationPattern);
    } else {
      // Fallback to standard haptic feedback
      hapticFeedback(fallbackType);
      return true;
    }
  }, [isVibrationSupported, vibratePattern]);

  // Predefined patterns
  const patterns = {
    notification: () => playCustomPattern({
      pattern: [{ duration: 200 }, { duration: 100 }, { duration: 200 }],
      fallbackType: 'medium'
    }),
    
    success: () => playCustomPattern({
      pattern: [{ duration: 100 }, { duration: 50 }, { duration: 100 }],
      fallbackType: 'light'
    }),
    
    error: () => playCustomPattern({
      pattern: [{ duration: 300 }, { duration: 100 }, { duration: 300 }, { duration: 100 }, { duration: 300 }],
      fallbackType: 'heavy'
    }),
    
    warning: () => playCustomPattern({
      pattern: [{ duration: 150 }, { duration: 100 }, { duration: 150 }],
      fallbackType: 'medium'
    }),
    
    tick: () => playCustomPattern({
      pattern: [{ duration: 50 }],
      fallbackType: 'light'
    }),
    
    heartbeat: () => playCustomPattern({
      pattern: [{ duration: 100 }, { duration: 100 }, { duration: 200 }],
      fallbackType: 'medium'
    }),
    
    pulse: () => playCustomPattern({
      pattern: [{ duration: 200 }],
      fallbackType: 'medium'
    })
  };

  const stopVibration = useCallback(() => {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
    }
  }, [isVibrationSupported]);

  return {
    isVibrationSupported,
    vibratePattern,
    playCustomPattern,
    patterns,
    stopVibration
  };
}