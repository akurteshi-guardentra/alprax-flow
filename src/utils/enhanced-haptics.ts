
import { HapticFeedbackType } from '@capacitor/haptics';

// Enhanced haptic feedback types
export type EnhancedHapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'selection'
  | 'impact'
  | 'notification';

// Capacitor Haptics interface
interface CapacitorHaptics {
  impact: (options: { style: 'light' | 'medium' | 'heavy' }) => Promise<void>;
  notification: (options: { type: 'success' | 'warning' | 'error' }) => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}

// Check if we're in a Capacitor environment
const isCapacitorAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         window.Capacitor !== undefined && 
         window.Capacitor.isNativePlatform();
};

// Get Capacitor Haptics if available
const getCapacitorHaptics = (): CapacitorHaptics | null => {
  if (!isCapacitorAvailable()) return null;
  
  try {
    return window.Capacitor.Plugins.Haptics as CapacitorHaptics;
  } catch {
    return null;
  }
};

// Web Vibration API fallback
const webVibrate = (pattern: number | number[]): boolean => {
  if (!navigator.vibrate) return false;
  
  try {
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
};

// Enhanced haptic feedback function
export const triggerHapticFeedback = async (type: EnhancedHapticType): Promise<void> => {
  const haptics = getCapacitorHaptics();
  
  if (haptics) {
    try {
      switch (type) {
        case 'light':
          await haptics.impact({ style: 'light' });
          break;
        case 'medium':
          await haptics.impact({ style: 'medium' });
          break;
        case 'heavy':
          await haptics.impact({ style: 'heavy' });
          break;
        case 'success':
          await haptics.notification({ type: 'success' });
          break;
        case 'warning':
          await haptics.notification({ type: 'warning' });
          break;
        case 'error':
          await haptics.notification({ type: 'error' });
          break;
        case 'selection':
          await haptics.selectionChanged();
          break;
        case 'impact':
          await haptics.impact({ style: 'medium' });
          break;
        case 'notification':
          await haptics.notification({ type: 'success' });
          break;
      }
      return;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
  
  // Fallback to web vibration
  const vibrationPatterns: Record<EnhancedHapticType, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 50,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [50, 50, 50],
    selection: 5,
    impact: 30,
    notification: [10, 30, 10]
  };
  
  webVibrate(vibrationPatterns[type]);
};

// Convenience functions
export const lightHaptic = () => triggerHapticFeedback('light');
export const mediumHaptic = () => triggerHapticFeedback('medium');
export const heavyHaptic = () => triggerHapticFeedback('heavy');
export const successHaptic = () => triggerHapticFeedback('success');
export const warningHaptic = () => triggerHapticFeedback('warning');
export const errorHaptic = () => triggerHapticFeedback('error');
export const selectionHaptic = () => triggerHapticFeedback('selection');

// Type guard for enhanced haptic types
export const isValidHapticType = (type: string): type is EnhancedHapticType => {
  return ['light', 'medium', 'heavy', 'success', 'warning', 'error', 'selection', 'impact', 'notification'].includes(type);
};

// Batch haptic feedback for sequences
export const triggerHapticSequence = async (
  sequence: { type: EnhancedHapticType; delay?: number }[]
): Promise<void> => {
  for (const { type, delay = 0 } of sequence) {
    await triggerHapticFeedback(type);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  triggerHapticFeedback,
  lightHaptic,
  mediumHaptic,
  heavyHaptic,
  successHaptic,
  warningHaptic,
  errorHaptic,
  selectionHaptic,
  triggerHapticSequence,
  isValidHapticType
};
