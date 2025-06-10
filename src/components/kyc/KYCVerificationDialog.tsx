
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KYCVerification, KYCVerificationStatus } from './types';

interface KYCVerificationDialogProps {
  verification: KYCVerification;
  onStatusUpdate: (verificationId: string, status: KYCVerificationStatus, notes?: string) => void;
}

export const KYCVerificationDialog: React.FC<KYCVerificationDialogProps> = ({
  verification,
  onStatusUpdate
}) => {
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = (status: KYCVerificationStatus) => {
    onStatusUpdate(verification.id, status, notes);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>KYC Verification Details</DialogTitle>
          <DialogDescription>
            View and update the status of this KYC verification.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              User
            </Label>
            <Input 
              id="name" 
              value={verification.profiles?.full_name || verification.profiles?.username || 'N/A'} 
              className="col-span-3" 
              disabled 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="documentType" className="text-right">
              Document Type
            </Label>
            <Input 
              id="documentType" 
              value={verification.document_type} 
              className="col-span-3" 
              disabled 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="submittedAt" className="text-right">
              Submitted At
            </Label>
            <Input 
              id="submittedAt" 
              value={new Date(verification.submitted_at).toLocaleDateString()} 
              className="col-span-3" 
              disabled 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Input 
              id="status" 
              value={verification.status} 
              className="col-span-3" 
              disabled 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="documentUrl" className="text-right">
              Document URL
            </Label>
            <Input 
              id="documentUrl" 
              value={verification.document_url} 
              className="col-span-3" 
              disabled 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input
              id="notes"
              className="col-span-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="secondary" 
            onClick={() => handleStatusUpdate('verified')}
          >
            Verify
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleStatusUpdate('rejected')}
          >
            Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
