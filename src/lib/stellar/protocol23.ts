import { server } from './config';

// Protocol 23 specific utilities and helpers
export class Protocol23Handler {
  private static readonly RESET_DETECTION_KEY = 'stellar-testnet-reset-detected';
  private static readonly LAST_KNOWN_LEDGER_KEY = 'last-known-ledger';

  /**
   * Detects if a testnet reset has occurred by checking ledger continuity
   */
  static async detectTestnetReset(): Promise<boolean> {
    try {
      const currentLedger = await server.ledgers().order('desc').limit(1).call();
      const latestLedgerSeq = currentLedger.records[0]?.sequence;
      
      if (!latestLedgerSeq) return false;

      const lastKnownLedger = localStorage.getItem(this.LAST_KNOWN_LEDGER_KEY);
      
      if (lastKnownLedger) {
        const lastKnown = parseInt(lastKnownLedger, 10);
        // If current ledger is significantly lower than last known, reset occurred
        if (latestLedgerSeq < lastKnown - 1000) {
          localStorage.setItem(this.RESET_DETECTION_KEY, 'true');
          this.clearPostResetData();
          return true;
        }
      }

      // Update last known ledger
      localStorage.setItem(this.LAST_KNOWN_LEDGER_KEY, latestLedgerSeq.toString());
      return false;
    } catch (error) {
      console.warn('Failed to detect testnet reset:', error);
      return false;
    }
  }

  /**
   * Clears data that becomes invalid after a testnet reset
   */
  static clearPostResetData(): void {
    // Clear test account data
    localStorage.removeItem('stellar-test-accounts');
    localStorage.removeItem('stellar-active-account');
    
    // Clear any cached balances or account states
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('stellar-balance-') || key.startsWith('stellar-account-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Cleared post-reset data due to testnet reset');
  }

  /**
   * Checks if we've already detected a reset in this session
   */
  static wasResetDetected(): boolean {
    return localStorage.getItem(this.RESET_DETECTION_KEY) === 'true';
  }

  /**
   * Marks reset as handled
   */
  static markResetHandled(): void {
    localStorage.removeItem(this.RESET_DETECTION_KEY);
  }

  /**
   * Enhanced account validation for post-reset scenarios
   */
  static async validateAccountExists(publicKey: string): Promise<boolean> {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      // Account doesn't exist or network error
      return false;
    }
  }

  /**
   * Enhanced friendbot funding with retry logic
   */
  static async fundAccountWithRetry(publicKey: string, maxRetries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        
        if (response.ok) {
          console.log(`Account funded successfully on attempt ${attempt}`);
          return true;
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        console.warn(`Funding attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.error('Failed to fund account after all retries');
    return false;
  }
}