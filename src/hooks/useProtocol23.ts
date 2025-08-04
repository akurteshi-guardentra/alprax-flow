import { useEffect, useState } from 'react';
import { Protocol23Handler } from '@/lib/stellar/protocol23';
import { toast } from 'sonner';

export function useProtocol23() {
  const [resetDetected, setResetDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkForReset = async () => {
      if (Protocol23Handler.wasResetDetected()) {
        setResetDetected(true);
        return;
      }

      setIsChecking(true);
      try {
        const resetOccurred = await Protocol23Handler.detectTestnetReset();
        if (resetOccurred) {
          setResetDetected(true);
          toast.warning(
            'Testnet Reset Detected', 
            { 
              description: 'Your test accounts have been cleared. You can create new ones.',
              duration: 5000 
            }
          );
        }
      } catch (error) {
        console.warn('Error checking for testnet reset:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Check for reset on mount and periodically
    checkForReset();
    const interval = setInterval(checkForReset, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleResetAcknowledged = () => {
    Protocol23Handler.markResetHandled();
    setResetDetected(false);
  };

  return {
    resetDetected,
    isChecking,
    handleResetAcknowledged
  };
}