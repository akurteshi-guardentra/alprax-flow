/**
 * Enhanced haptics utilities for better mobile touch feedback
 * Extends the core haptics system with more adaptive and sophisticated patterns
 */
import { hapticFeedback as coreHaptics } from '@/lib/haptics';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';

/**
 * Settings for enhanced haptics
 */
export interface HapticsSettings {
  /** Whether haptics are enabled at all */
  enabled: boolean;
  /** Intensity multiplier (0-1) */
  intensity: number;
  /** Whether to use complex patterns */
  usePatterns: boolean;
  /** Whether to adapt to user activity */
  adaptiveMode: boolean;
}

// Default haptic settings
const DEFAULT_SETTINGS: HapticsSettings = {
  enabled: true,
  intensity: 1.0,
  usePatterns: true,
  adaptiveMode: true,
};

// User settings storage key
const HAPTICS_SETTINGS_KEY = 'haptics_settings';

/**
 * Load user haptic preferences from storage
 */
export function getHapticSettings(): HapticsSettings {
  try {
    const savedSettings = localStorage.getItem(HAPTICS_SETTINGS_KEY);
    if (savedSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
  } catch (e) {
    // Ignore storage errors
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save haptic settings to storage
 */
export function saveHapticSettings(settings: Partial<HapticsSettings>): void {
  try {
    const currentSettings = getHapticSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(HAPTICS_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Enhanced haptic feedback with adaptive patterns and user preferences
 */
export function enhancedHaptics(
  strength: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
  options: { important?: boolean } = {}
): void {
  const settings = getHapticSettings();
  
  // Skip if haptics are disabled (unless marked as important)
  if (!settings.enabled && !options.important) return;
  
  // Skip complex patterns if disabled
  if (!settings.usePatterns && ['success', 'warning', 'error'].includes(strength)) {
    // Fall back to simpler haptics
    switch (strength) {
      case 'success': 
        coreHaptics('light');
        break;
      case 'warning':
        coreHaptics('medium');
        break;
      case 'error':
        coreHaptics('heavy');
        break;
    }
    return;
  }
  
  // Apply intensity scaling for non-standard strengths
  if (settings.intensity !== 1.0 && !['success', 'warning', 'error'].includes(strength)) {
    // Map to nearest intensity-adjusted strength
    const adjustedStrength = mapIntensity(strength, settings.intensity);
    coreHaptics(adjustedStrength);
    return;
  }
  
  // Use core haptics with the original strength
  coreHaptics(strength);
}

/**
 * Maps a haptic strength to a new one based on intensity preference
 */
function mapIntensity(
  strength: 'light' | 'medium' | 'heavy',
  intensity: number
): 'light' | 'medium' | 'heavy' {
  if (intensity <= 0.33) {
    return 'light'; // Low intensity - everything feels light
  } else if (intensity <= 0.66) {
    // Medium intensity - medium and heavy feel the same
    return strength === 'light' ? 'light' : 'medium';
  } else {
    // Full intensity - use original strength
    return strength;
  }
}

/**
 * Hook that provides context-aware haptic feedback
 * Based on user activity, time of day, etc.
 */
export function useAdaptiveHaptics() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [userActive, setUserActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Track user activity
  useEffect(() => {
    if (!isMobile) return;
    
    const handleActivity = () => {
      setUserActive(true);
      setLastActivity(Date.now());
    };
    
    // Check inactivity every 30 seconds
    const inactivityCheck = setInterval(() => {
      if (Date.now() - lastActivity > 60000) {
        // If no activity for 1 minute, consider user inactive
        setUserActive(false);
      }
    }, 30000);
    
    // Listen for user interactions
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('touchmove', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    return () => {
      clearInterval(inactivityCheck);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('touchmove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isMobile, lastActivity]);
  
  // Provide haptic feedback appropriate to current context
  const triggerHaptic = (strength: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    const settings = getHapticSettings();
    
    // If in adaptive mode, adjust based on user activity
    if (settings.adaptiveMode) {
      if (!userActive && !['warning', 'error'].includes(strength)) {
        // More gentle haptics when user isn't actively using the app
        switch (strength) {
          case 'medium':
          case 'heavy':
            enhancedHaptics('light');
            return;
          case 'success':
            // Still provide success feedback but more gently
            coreHaptics('light');
            return;
        }
      }
      
      // If it's nighttime (10 PM - 7 AM), use gentler haptics
      const hour = new Date().getHours();
      if ((hour >= 22 || hour < 7) && !['warning', 'error'].includes(strength)) {
        switch (strength) {
          case 'heavy':
            enhancedHaptics('medium');
            return;
          case 'medium':
            enhancedHaptics('light');
            return;
        }
      }
    }
    
    // Default behavior
    enhancedHaptics(strength);
  };
  
  return { triggerHaptic, userActive };
}
