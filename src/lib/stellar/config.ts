
import { Horizon, Networks } from 'stellar-sdk';

// Protocol 23 ready configuration
// Testnet URL remains the same, but SDK v14+ handles Protocol 23 compatibility
export const server = new Horizon.Server('https://horizon-testnet.stellar.org');
export const networkPassphrase = Networks.TESTNET;

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
