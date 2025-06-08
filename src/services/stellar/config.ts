
import { Horizon, Networks } from 'stellar-sdk';

// Environment configuration
const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET';
const HORIZON_URL = STELLAR_NETWORK === 'TESTNET' 
  ? 'https://horizon-testnet.stellar.org' 
  : 'https://horizon.stellar.org';

// Initialize Stellar server based on environment
export const server = new Horizon.Server(HORIZON_URL);
export const network = STELLAR_NETWORK === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC;

// Export configuration properties
export const config = {
  isTestnet: STELLAR_NETWORK === 'TESTNET',
  horizonUrl: HORIZON_URL,
  networkPassphrase: network,
  defaultFee: '100', // 100 stroops = 0.00001 XLM
};
