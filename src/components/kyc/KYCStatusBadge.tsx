
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { KYCVerificationStatus } from './types';

interface KYCStatusBadgeProps {
  status: KYCVerificationStatus;
}

export const KYCStatusBadge: React.FC<KYCStatusBadgeProps> = ({ status }) => {
  if (status === 'pending') {
    return <Badge variant="outline">Pending</Badge>;
  }
  
  if (status === 'verified') {
    return (
      <Badge className="bg-green-500 text-white border-none">
        Verified <CheckCircle className="w-4 h-4 ml-1" />
      </Badge>
    );
  }
  
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-500 text-white border-none">
        Rejected <AlertTriangle className="w-4 h-4 ml-1" />
      </Badge>
    );
  }
  
  return null;
};
