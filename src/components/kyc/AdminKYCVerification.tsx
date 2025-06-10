
import React from 'react';
import { KYCVerificationTable } from './KYCVerificationTable';
import { useKYCVerifications } from './hooks/useKYCVerifications';

const AdminKYCVerification = () => {
  const { verifications, isLoading, updateVerification } = useKYCVerifications();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">KYC Verifications</h1>
      <KYCVerificationTable
        verifications={verifications || []}
        loading={isLoading}
        onStatusUpdate={updateVerification}
      />
    </div>
  );
};

export default AdminKYCVerification;
