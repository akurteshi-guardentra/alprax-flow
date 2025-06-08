
import React, { createContext, useContext, ReactNode } from 'react';
import { useTestAccounts } from '@/hooks/useTestAccounts';
import { TestAccount, TestAccountContextType } from '@/lib/stellar/types';

// Create context with default values
const TestAccountCtx = createContext<TestAccountContextType>({
  accounts: [],
  activeAccount: null,
  createAccount: () => Promise.resolve(),
  switchAccount: () => {},
  fundAccount: () => Promise.resolve(),
  refreshBalance: () => Promise.resolve(),
  isLoading: false
});

export const useTestAccountContext = () => useContext(TestAccountCtx);

interface TestAccountProviderProps {
  children: ReactNode;
}

export const TestAccountProvider: React.FC<TestAccountProviderProps> = ({ children }) => {
  const testAccounts = useTestAccounts();
  
  // Convert the mutate functions to return Promises
  const contextValue: TestAccountContextType = {
    accounts: testAccounts.accounts,
    activeAccount: testAccounts.activeAccount,
    createAccount: (name: string) => {
      return Promise.resolve(testAccounts.createAccount(name));
    },
    switchAccount: testAccounts.switchAccount,
    fundAccount: (id: string) => {
      return Promise.resolve(testAccounts.fundAccount(id));
    },
    refreshBalance: (id: string) => {
      return Promise.resolve(testAccounts.refreshBalance(id));
    },
    isLoading: testAccounts.isLoading
  };
  
  return (
    <TestAccountCtx.Provider value={contextValue}>
      {children}
    </TestAccountCtx.Provider>
  );
};
