import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react';
import { server } from '@/lib/stellar/config';
import { fundTestAccount } from '@/lib/stellar/payment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RecipientAccountValidatorProps {
  stellarAddress: string;
  onValidationChange: (isValid: boolean, needsFunding: boolean) => void;
  className?: string;
}

export const RecipientAccountValidator: React.FC<RecipientAccountValidatorProps> = ({
  stellarAddress,
  onValidationChange,
  className = ''
}) => {
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid' | 'needs_funding';
    message: string;
    canAutoFund: boolean;
  }>({
    status: 'idle',
    message: '',
    canAutoFund: false
  });

  const [isAutoFunding, setIsAutoFunding] = useState(false);

  useEffect(() => {
    if (!stellarAddress || stellarAddress.length !== 56 || !stellarAddress.startsWith('G')) {
      setValidationState({
        status: 'invalid',
        message: 'Invalid Stellar address format',
        canAutoFund: false
      });
      onValidationChange(false, false);
      return;
    }

    validateAccount();
  }, [stellarAddress]);

  const validateAccount = async () => {
    setValidationState({
      status: 'validating',
      message: 'Checking account...',
      canAutoFund: false
    });

    try {
      await server.loadAccount(stellarAddress);
      const newState = {
        status: 'valid' as const,
        message: 'Account exists and ready to receive payments',
        canAutoFund: false
      };
      setValidationState(newState);
      onValidationChange(true, false);
    } catch (error) {
      const newState = {
        status: 'needs_funding' as const,
        message: 'Account needs to be activated with initial funds',
        canAutoFund: true
      };
      setValidationState(newState);
      onValidationChange(false, true);
    }
  };

  const handleAutoFund = async () => {
    setIsAutoFunding(true);
    try {
      const result = await fundTestAccount(stellarAddress);
      if (result.success) {
        toast.success('Account activated successfully!');
        // Wait a moment and re-validate
        setTimeout(validateAccount, 2000);
      } else {
        toast.error(`Failed to activate account: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to activate account');
    } finally {
      setIsAutoFunding(false);
    }
  };

  const getStatusIcon = () => {
    switch (validationState.status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'needs_funding':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (validationState.status) {
      case 'valid':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      case 'needs_funding':
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (validationState.status === 'idle') return null;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border bg-muted/50 ${className}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {validationState.message}
        </span>
      </div>
      
      {validationState.status === 'needs_funding' && validationState.canAutoFund && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleAutoFund}
          disabled={isAutoFunding}
          className="ml-2"
        >
          {isAutoFunding ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <Users className="h-3 w-3 mr-1" />
              Activate Account
            </>
          )}
        </Button>
      )}
    </div>
  );
};