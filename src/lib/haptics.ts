
/**
 * Utility for providing haptic feedback on supported devices
 * Falls back gracefully on unsupported devices
 */

type HapticStrength = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const hapticFeedback = (strength: HapticStrength = 'light') => {
  // Check if navigator exists (SSR safety)
  if (typeof navigator === 'undefined') return;
  
  try {
    // iOS haptic feedback
    if ('vibrate' in navigator) {
      switch (strength) {
        case 'light':
          navigator.vibrate(5);
          break;
        case 'medium':
          navigator.vibrate(15);
          break;
        case 'heavy':
          navigator.vibrate(25);
          break;
        case 'success':
          // Success pattern: short-pause-long
          navigator.vibrate([5, 50, 15]);
          break;
        case 'warning':
          // Warning pattern: medium-pause-medium
          navigator.vibrate([15, 50, 15]);
          break;
        case 'error':
          // Error pattern: short-pause-short-pause-long
          navigator.vibrate([5, 50, 5, 50, 25]);
          break;
        default:
          navigator.vibrate(5);
      }
    }
    
    // Trigger sound feedback if available
    // This is a subtle way to enhance feedback on desktop
    if (window.AudioContext) {
      const audioCtx = new window.AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Very quiet gain - just enough to be perceptible
      gainNode.gain.value = 0.03;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Different frequencies for different feedback types
      switch (strength) {
        case 'success':
          oscillator.frequency.value = 1200;
          break;
        case 'warning':
          oscillator.frequency.value = 800;
          break;
        case 'error':
          oscillator.frequency.value = 400;
          break;
        default:
          oscillator.frequency.value = 1000;
      }
      
      // Determine duration based on strength
      let duration = 10;
      if (strength === 'medium') duration = 15;
      else if (strength === 'heavy' || strength === 'success' || strength === 'warning' || strength === 'error') duration = 25;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, duration);
    }
  } catch (error) {
    // Silently fail if haptics aren't supported
    console.debug('Haptic feedback not supported:', error);
  }
};
