
import { server } from './config';

/**
 * Fetch account balance from Stellar network
 * @param publicKey - Stellar public key to query
 * @returns Array of balances for different assets
 */
export async function getBalance(publicKey: string): Promise<{ asset: string; balance: string }[]> {
  try {
    console.log(`Fetching balance for: ${publicKey}`);
    const account = await server.loadAccount(publicKey);
    console.log('Account loaded successfully');
    
    return account.balances.map((balance: any) => ({
      asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
      balance: balance.balance,
    }));
  } catch (error) {
    console.error('Error getting balance:', error);
    // Check if the error is because the account doesn't exist on the network
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Account not found on network, likely needs funding');
    }
    return [];
  }
}

/**
 * Check if a Stellar address exists on the network
 * @param address - Stellar public key to verify
 * @returns true if account exists, false otherwise
 */
export async function checkAddressExists(address: string): Promise<boolean> {
  try {
    await server.loadAccount(address);
    return true;
  } catch (error) {
    // If we get a 404, the account doesn't exist
    return false;
  }
}
