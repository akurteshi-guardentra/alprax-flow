
import { useState, useEffect } from 'react';

export const useDataSaverMode = () => {
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Check for low-end device indicators
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    setIsLowEndDevice(memory <= 4 || cores <= 2);
    
    // Check connection type if available
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
      setIsDataSaverEnabled(connection.saveData || false);
    }
  }, []);

  return {
    isDataSaverEnabled,
    connectionType,
    isLowEndDevice
  };
};
