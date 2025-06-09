
import { Horizon, Networks } from 'stellar-sdk';

// Initialize Stellar server (testnet for development)
export const server = new Horizon.Server('https://horizon-testnet.stellar.org');
export const networkPassphrase = Networks.TESTNET;
