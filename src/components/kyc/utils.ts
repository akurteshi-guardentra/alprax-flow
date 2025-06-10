
import { KYCVerificationStatus, ProfileKYCLevel } from './types';

// Map KYC verification status to profile kyc_level
export const getProfileKycLevel = (status: KYCVerificationStatus): ProfileKYCLevel => {
  switch (status) {
    case 'verified':
      return 'verified';
    case 'rejected':
      return 'basic'; // Map rejected to basic level
    case 'pending':
    default:
      return 'pending';
  }
};
