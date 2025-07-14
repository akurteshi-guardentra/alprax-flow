
import { Horizon, Networks } from 'stellar-sdk';

// Environment configuration
const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET';
const HORIZON_URL = STELLAR_NETWORK === 'TESTNET' 
  ? 'https://horizon-testnet.stellar.org' 
  : 'https://horizon.stellar.org';

// Initialize Stellar server based on environment
export const server = new Horizon.Server(HORIZON_URL);
export const network = STELLAR_NETWORK === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC;

// Dynamic fee fetching for Protocol 23 compatibility
export async function getBaseFee(): Promise<string> {
  try {
    const feeStats = await server.feeStats();
    return feeStats.last_ledger_base_fee || '100';
  } catch (error) {
    console.warn('Failed to fetch dynamic fees, using default:', error);
    return '100'; // Fallback to 100 stroops
  }
}

// Export configuration properties
export const config = {
  isTestnet: STELLAR_NETWORK === 'TESTNET',
  horizonUrl: HORIZON_URL,
  networkPassphrase: network,
  defaultFee: '100', // Fallback fee in stroops
  getBaseFee,
};
