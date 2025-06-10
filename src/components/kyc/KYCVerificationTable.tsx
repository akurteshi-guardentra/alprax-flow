
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KYCVerification, KYCVerificationStatus } from './types';
import { KYCStatusBadge } from './KYCStatusBadge';
import { KYCVerificationDialog } from './KYCVerificationDialog';

interface KYCVerificationTableProps {
  verifications: KYCVerification[];
  loading: boolean;
  onStatusUpdate: (verificationId: string, status: KYCVerificationStatus, notes?: string) => void;
}

export const KYCVerificationTable: React.FC<KYCVerificationTableProps> = ({
  verifications,
  loading,
  onStatusUpdate
}) => {
  if (loading) {
    return <p>Loading verifications...</p>;
  }

  return (
    <Table>
      <TableCaption>A list of KYC verifications for users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Document Type</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {verifications.map((verification) => (
          <TableRow key={verification.id}>
            <TableCell>
              {verification.profiles?.full_name || verification.profiles?.username || 'N/A'}
              {verification.profiles?.country && ` (${verification.profiles.country})`}
            </TableCell>
            <TableCell>{verification.document_type}</TableCell>
            <TableCell>{new Date(verification.submitted_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <KYCStatusBadge status={verification.status} />
            </TableCell>
            <TableCell className="text-right">
              <KYCVerificationDialog
                verification={verification}
                onStatusUpdate={onStatusUpdate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
