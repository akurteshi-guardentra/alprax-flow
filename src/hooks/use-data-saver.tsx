import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user has data saver mode enabled
 * Used for optimizing mobile transactions with data-heavy content
 */
export function useDataSaverMode(): { 
  isDataSaverEnabled: boolean, 
  connectionType: string | null,
  isLowEndDevice: boolean
} {
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Check for data saver mode and connection type
    const checkConnection = () => {
      try {
        // @ts-ignore - Navigator connection API
        if ('connection' in navigator && navigator.connection) {
          // @ts-ignore
          const { saveData, effectiveType, type } = navigator.connection;
          setIsDataSaverEnabled(!!saveData);
          setConnectionType(effectiveType || type || null);
        }
      } catch (e) {
        console.error('Error detecting data saver mode:', e);
      }
    };

    // Check for low-end device using various performance metrics
    const checkDeviceCapability = () => {
      try {
        // Check CPU cores - fewer cores generally means lower performance
        const cpuCores = navigator.hardwareConcurrency || 0;
        
        // Check device memory if available
        // @ts-ignore - Non-standard API
        const deviceMemory = navigator.deviceMemory || 0;
        
        // Use performance API to determine if this is a low-end device
        // Use a combination of factors for best determination
        const isLowEnd = 
          cpuCores <= 4 ||  // 4 or fewer cores
          deviceMemory <= 2 ||  // 2GB or less RAM
          // @ts-ignore - Navigator connection API
          (navigator.connection?.effectiveType && 
          // @ts-ignore
          ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType));
          
        setIsLowEndDevice(isLowEnd);
      } catch (e) {
        console.error('Error detecting device capabilities:', e);
        // Default to false if we can't detect
        setIsLowEndDevice(false);
      }
    };
    
    // Initial check
    checkConnection();
    checkDeviceCapability();
    
    // Set up listeners for connection changes if available
    // @ts-ignore - Navigator connection API
    if ('connection' in navigator && navigator.connection && navigator.connection.addEventListener) {
      // @ts-ignore
      navigator.connection.addEventListener('change', checkConnection);
      
      return () => {
        // @ts-ignore
        navigator.connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);

  return { isDataSaverEnabled, connectionType, isLowEndDevice };
}
