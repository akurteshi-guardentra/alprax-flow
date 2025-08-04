import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResetRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
  onRecreateAccounts: () => void;
}

export function ResetRecoveryDialog({ 
  open, 
  onClose, 
  onRecreateAccounts 
}: ResetRecoveryDialogProps) {
  const handleRecreate = () => {
    onRecreateAccounts();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Testnet Reset Detected</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              The Stellar testnet has been reset for Protocol 23 upgrade. 
              All previous test accounts and balances have been cleared.
            </p>
            <p className="text-sm text-muted-foreground">
              This is normal and expected as part of the Protocol 23 upgrade process. 
              You can create new test accounts to continue using the app.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleRecreate} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Create New Test Accounts
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}