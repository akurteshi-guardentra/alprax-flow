import React, { useState, useCallback } from 'react';
import { Plus, User, Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createAccount } from '@/lib/stellar/account';
import { fundTestAccount } from '@/lib/stellar/payment';
import { getBalance } from '@/lib/stellar/utils';

interface TestAccount {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  balance: string;
  isActive: boolean;
}

export const TestAccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  const createTestAccount = useCallback(async () => {
    if (!newAccountName.trim()) {
      toast.error('Please enter a name for the account');
      return;
    }

    setIsCreating(true);
    try {
      const account = await createAccount();
      if (!account) {
        throw new Error('Failed to create account');
      }

      // Get initial balance
      const balances = await getBalance(account.publicKey);
      const xlmBalance = balances.find(b => b.asset === 'XLM')?.balance || '0';

      const testAccount: TestAccount = {
        id: account.id,
        name: newAccountName.trim(),
        publicKey: account.publicKey,
        secretKey: atob(account.encryptedSecret), // Decrypt for testing
        balance: xlmBalance,
        isActive: parseFloat(xlmBalance) > 0
      };

      setAccounts(prev => [...prev, testAccount]);
      setNewAccountName('');
      toast.success(`Test account "${testAccount.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating test account:', error);
      toast.error('Failed to create test account');
    } finally {
      setIsCreating(false);
    }
  }, [newAccountName]);

  const fundAccount = useCallback(async (account: TestAccount) => {
    try {
      const result = await fundTestAccount(account.publicKey);
      if (result.success) {
        // Refresh balance
        setTimeout(async () => {
          const balances = await getBalance(account.publicKey);
          const xlmBalance = balances.find(b => b.asset === 'XLM')?.balance || '0';
          
          setAccounts(prev => 
            prev.map(a => 
              a.id === account.id 
                ? { ...a, balance: xlmBalance, isActive: parseFloat(xlmBalance) > 0 }
                : a
            )
          );
        }, 2000);
        
        toast.success(`Funded ${account.name} with test XLM`);
      } else {
        toast.error(`Failed to fund account: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to fund account');
    }
  }, []);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  const refreshBalance = useCallback(async (account: TestAccount) => {
    try {
      const balances = await getBalance(account.publicKey);
      const xlmBalance = balances.find(b => b.asset === 'XLM')?.balance || '0';
      
      setAccounts(prev => 
        prev.map(a => 
          a.id === account.id 
            ? { ...a, balance: xlmBalance, isActive: parseFloat(xlmBalance) > 0 }
            : a
        )
      );
    } catch (error) {
      toast.error('Failed to refresh balance');
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Test Account Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new account */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              placeholder="e.g., Alice, Bob, Charlie"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTestAccount()}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={createTestAccount} 
              disabled={isCreating || !newAccountName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>

        {/* Account list */}
        <div className="space-y-3">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{account.name}</span>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Needs Funding'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {parseFloat(account.balance).toFixed(2)} XLM
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => refreshBalance(account)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-16">Public:</Label>
                  <code className="flex-1 bg-muted p-1 rounded text-xs">
                    {account.publicKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(account.publicKey, 'Public key')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${account.publicKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {!account.isActive && (
                  <Button
                    size="sm"
                    onClick={() => fundAccount(account)}
                  >
                    <Wallet className="h-3 w-3 mr-1" />
                    Fund Account
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(account.publicKey, 'Stellar address')}
                >
                  Copy Address
                </Button>
              </div>
            </div>
          ))}
          
          {accounts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No test accounts created yet. Create one to start testing payments.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};