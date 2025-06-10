
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionHistory } from '../components/TransactionHistory';
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { BrowserRouter } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock required hooks
vi.mock('@/hooks/useTransactionHistory');
vi.mock('@/hooks/use-mobile');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock route navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('TransactionHistory Component', () => {
  // Set up mock data
  const mockTransactions = [
    {
      id: 'tx_1',
      transaction_type: 'sent',
      amount: '250',
      recipient_name: 'John Doe',
      status: 'completed',
      created_at: new Date().toISOString(),
      memo: 'Rent payment'
    },
    {
      id: 'tx_2',
      transaction_type: 'received',
      amount: '100',
      recipient_name: 'Jane Smith',
      status: 'pending',
      created_at: new Date().toISOString(),
      transfer_purpose: 'Invoice payment'
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    (useTransactionHistory as any).mockReturnValue({
      transactions: mockTransactions,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      fiatRate: 1.2,
      defaultFiat: 'USD'
    });
    
    (useIsMobile as any).mockReturnValue(false);
  });

  it('renders transaction list correctly', () => {
    render(
      <BrowserRouter>
        <TransactionHistory />
      </BrowserRouter>
    );
    
    // Check for main component elements
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    
    // Check that transactions are rendered
    expect(screen.getByText(/Sent to John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Received from Jane Smith/)).toBeInTheDocument();
    
    // Check for transaction amounts
    expect(screen.getByText('-300.00 USD')).toBeInTheDocument();
    expect(screen.getByText('+120.00 USD')).toBeInTheDocument();
    
    // Check for status badges
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
    expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    (useTransactionHistory as any).mockReturnValue({
      transactions: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      fiatRate: 1.2,
      defaultFiat: 'USD'
    });
    
    render(
      <BrowserRouter>
        <TransactionHistory />
      </BrowserRouter>
    );
    
    // Check that skeleton loaders are displayed
    expect(screen.getByTestId('transaction-skeleton')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    (useTransactionHistory as any).mockReturnValue({
      transactions: [],
      isLoading: false,
      error: new Error('Failed to load transactions'),
      refetch: vi.fn(),
      fiatRate: 1.2,
      defaultFiat: 'USD'
    });
    
    render(
      <BrowserRouter>
        <TransactionHistory />
      </BrowserRouter>
    );
    
    // Check that error state is displayed
    expect(screen.getByText('Unable to load transactions')).toBeInTheDocument();
    expect(screen.getByText('Please check your connection and try again')).toBeInTheDocument();
  });

  it('shows empty state when there are no transactions', () => {
    (useTransactionHistory as any).mockReturnValue({
      transactions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      fiatRate: 1.2,
      defaultFiat: 'USD'
    });
    
    render(
      <BrowserRouter>
        <TransactionHistory />
      </BrowserRouter>
    );
    
    // Check that empty state is displayed
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('allows filtering transactions by search term', async () => {
    render(
      <BrowserRouter>
        <TransactionHistory />
      </BrowserRouter>
    );

    // Open filter panel
    fireEvent.click(screen.getByRole('button', { name: '' })); // Filter button has no accessible name
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      // Should show John's transaction but not Jane's
      expect(screen.getByText(/Sent to John Doe/)).toBeInTheDocument();
      expect(screen.queryByText(/Received from Jane Smith/)).not.toBeInTheDocument();
    });
  });
});
