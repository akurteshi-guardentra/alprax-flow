// Test account management UI - hidden from regular users
import { useState } from 'react';
import { useTestAccountContext } from "@/contexts/TestAccountContext";
import { useTransactionSubmission } from "@/hooks/useTransactionSubmission"; // Added for fiatRate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Wallet, RefreshCw, CreditCard, User, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hapticFeedback } from "@/lib/haptics";

export function TestAccountView() {
  const { accounts, activeAccount, createAccount, switchAccount, fundAccount, refreshBalance, isLoading } = useTestAccountContext();
  const [newAccountName, setNewAccountName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Get fiat rate and currency from hook
  const { fiatRate = 0, defaultFiat = "EUR" } = useTransactionSubmission();
  
  const handleCreateAccount = () => {
    if (!newAccountName.trim()) return;
    
    createAccount(newAccountName.trim());
    setNewAccountName("");
    setCreateDialogOpen(false);
    hapticFeedback("medium");
  };

  const handleSwitchAccount = (id: string) => {
    switchAccount(id);
    hapticFeedback("light");
  };
  
  const handleFundAccount = (id: string) => {
    hapticFeedback("medium");
    fundAccount(id);
  };
  
  const handleRefreshBalance = (id: string) => {
    hapticFeedback("light");
    refreshBalance(id);
  };
  
  const formatBalance = (balance: string) => {
    try {
      const balanceNum = parseFloat(balance);
      // Convert to fiat if rate is available
      const displayBalance = fiatRate > 0 ? balanceNum * fiatRate : balanceNum;
      return displayBalance.toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    } catch {
      return balance;
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-white">Test Accounts</CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>Create Test Account</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    placeholder="My Test Account"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  disabled={!newAccountName.trim() || isLoading} 
                  onClick={handleCreateAccount}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription className="text-white/60">
          These accounts are for testing purposes only
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {accounts.length === 0 ? (
            <div className="text-center py-6 text-white/50 text-sm">
              <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No test accounts yet</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 bg-slate-700/50 border-slate-600 hover:bg-slate-600"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create account
              </Button>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className={`p-3 rounded-lg border hover:bg-white/5 transition-colors ${
                  account.id === activeAccount?.id
                    ? "bg-blue-900/30 border-blue-700"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-white/60" />
                      <p className="font-medium text-white">{account.name}</p>
                      {account.id === activeAccount?.id && (
                        <Badge className="ml-2 bg-blue-600 text-white border-none text-[10px] py-0 h-5">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center">
                      <CreditCard className="h-3 w-3 mr-1 text-white/40" />
                      <span className="text-xs text-white/60 font-mono">
                        {account.publicKey.slice(0, 4)}...{account.publicKey.slice(-4)}
                      </span>
                    </div>
                      <div className="mt-2 flex items-center">
                      <Wallet className="h-3.5 w-3.5 mr-1.5 text-white/50" />
                      <span className="text-white/80 text-sm">
                        {formatBalance(account.balance)} {defaultFiat}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {account.id !== activeAccount?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSwitchAccount(account.id)}
                        className="h-7 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFundAccount(account.id)}
                      className="h-7 bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-300"
                    >
                      Fund
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRefreshBalance(account.id)}
                      className="h-7 text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
