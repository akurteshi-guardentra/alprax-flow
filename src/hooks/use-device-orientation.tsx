import { useState, useEffect, useCallback } from 'react';

export interface DeviceOrientation {
  alpha: number | null; // Z-axis rotation (0-360)
  beta: number | null;  // X-axis rotation (-180 to 180)
  gamma: number | null; // Y-axis rotation (-90 to 90)
  absolute: boolean;
}

export interface OrientationState {
  orientation: DeviceOrientation | null;
  isSupported: boolean;
  isPermissionGranted: boolean;
  portrait: boolean;
  landscape: boolean;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<OrientationState>({
    orientation: null,
    isSupported: typeof DeviceOrientationEvent !== 'undefined',
    isPermissionGranted: false,
    portrait: window.innerHeight > window.innerWidth,
    landscape: window.innerWidth > window.innerHeight
  });

  const handleOrientationChange = useCallback((event: DeviceOrientationEvent) => {
    setState(prev => ({
      ...prev,
      orientation: {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute
      }
    }));
  }, []);

  const handleScreenOrientationChange = useCallback(() => {
    setState(prev => ({
      ...prev,
      portrait: window.innerHeight > window.innerWidth,
      landscape: window.innerWidth > window.innerHeight
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permission === 'granted';
        
        setState(prev => ({ ...prev, isPermissionGranted: granted }));
        return granted;
      } else {
        // Android and older iOS versions
        setState(prev => ({ ...prev, isPermissionGranted: true }));
        return true;
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const startListening = useCallback(async () => {
    if (!state.isSupported) return false;

    const hasPermission = await requestPermission();
    if (!hasPermission) return false;

    window.addEventListener('deviceorientation', handleOrientationChange);
    window.addEventListener('resize', handleScreenOrientationChange);
    
    return true;
  }, [state.isSupported, requestPermission, handleOrientationChange, handleScreenOrientationChange]);

  const stopListening = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientationChange);
    window.removeEventListener('resize', handleScreenOrientationChange);
  }, [handleOrientationChange, handleScreenOrientationChange]);

  useEffect(() => {
    // Listen for screen orientation changes
    window.addEventListener('resize', handleScreenOrientationChange);
    
    return () => {
      stopListening();
    };
  }, [handleScreenOrientationChange, stopListening]);

  return {
    ...state,
    requestPermission,
    startListening,
    stopListening
  };
}