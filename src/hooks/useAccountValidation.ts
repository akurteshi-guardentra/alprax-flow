import { useState, useCallback } from 'react';
import { server } from '@/lib/stellar/config';
import { fundTestAccount } from '@/lib/stellar/payment';
import { toast } from 'sonner';

export interface AccountValidationResult {
  isValid: boolean;
  exists: boolean;
  needsFunding: boolean;
  error?: string;
}

export interface UseAccountValidationReturn {
  validationResult: AccountValidationResult | null;
  isValidating: boolean;
  isAutoFunding: boolean;
  validateAccount: (stellarAddress: string) => Promise<AccountValidationResult>;
  autoFundAccount: (stellarAddress: string) => Promise<boolean>;
}

export const useAccountValidation = (): UseAccountValidationReturn => {
  const [validationResult, setValidationResult] = useState<AccountValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoFunding, setIsAutoFunding] = useState(false);

  const validateAccount = useCallback(async (stellarAddress: string): Promise<AccountValidationResult> => {
    setIsValidating(true);
    
    try {
      // Validate address format first
      if (!stellarAddress || stellarAddress.length !== 56 || !stellarAddress.startsWith('G')) {
        const result = {
          isValid: false,
          exists: false,
          needsFunding: false,
          error: 'Invalid Stellar address format'
        };
        setValidationResult(result);
        return result;
      }

      // Check if account exists on Stellar network
      try {
        await server.loadAccount(stellarAddress);
        const result = {
          isValid: true,
          exists: true,
          needsFunding: false
        };
        setValidationResult(result);
        return result;
      } catch (error) {
        // Account doesn't exist, needs funding
        const result = {
          isValid: false,
          exists: false,
          needsFunding: true,
          error: 'Account needs to be activated on the Stellar network'
        };
        setValidationResult(result);
        return result;
      }
    } catch (error) {
      const result = {
        isValid: false,
        exists: false,
        needsFunding: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const autoFundAccount = useCallback(async (stellarAddress: string): Promise<boolean> => {
    setIsAutoFunding(true);
    
    try {
      const fundingResult = await fundTestAccount(stellarAddress);
      
      if (fundingResult.success) {
        toast.success('Account activated successfully!');
        
        // Wait a moment and re-validate
        setTimeout(async () => {
          await validateAccount(stellarAddress);
        }, 2000);
        
        return true;
      } else {
        toast.error(`Failed to activate account: ${fundingResult.error}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to activate account: ${errorMessage}`);
      return false;
    } finally {
      setIsAutoFunding(false);
    }
  }, [validateAccount]);

  return {
    validationResult,
    isValidating,
    isAutoFunding,
    validateAccount,
    autoFundAccount
  };
};