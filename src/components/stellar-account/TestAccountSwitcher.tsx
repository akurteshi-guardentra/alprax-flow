
import { useState } from "react";
import { Loader2, Plus, Wallet, RefreshCw, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTestAccountContext } from "@/contexts/TestAccountContext";
import { TestAccount } from "@/lib/stellar/types";
import { hapticFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export function TestAccountSwitcher() {
  const { accounts, activeAccount, createAccount, switchAccount, fundAccount, refreshBalance, isLoading } = useTestAccountContext();
  const [newAccountName, setNewAccountName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const handleCreateAccount = () => {
    if (!newAccountName.trim()) return;
    
    createAccount(newAccountName.trim());
    setNewAccountName("");
    setCreateDialogOpen(false);
    hapticFeedback("medium");
  };
  
  const handleSwitchAccount = (id: string) => {
    switchAccount(id);
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
      return parseFloat(balance).toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    } catch {
      return balance;
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-white/70">Test Accounts</h3>
        
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
            <DialogFooter>
              <Button 
                disabled={!newAccountName.trim() || isLoading} 
                onClick={handleCreateAccount}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
            <AccountCard 
              key={account.id}
              account={account} 
              isActive={account.id === activeAccount?.id}
              onSwitch={() => handleSwitchAccount(account.id)}
              onFund={() => handleFundAccount(account.id)}
              onRefresh={() => handleRefreshBalance(account.id)}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: TestAccount;
  isActive: boolean;
  onSwitch: () => void;
  onFund: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

function AccountCard({ account, isActive, onSwitch, onFund, onRefresh, isLoading }: AccountCardProps) {
  const formattedBalance = parseFloat(account.balance).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg p-3 transition-all border",
        isActive 
          ? "bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-blue-500/30" 
          : "bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/50 hover:border-slate-700"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isActive ? "bg-blue-400" : "bg-slate-500"
          )} />
          <span className="font-medium text-sm text-white">{account.name}</span>
        </div>
        
        {!isActive && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
            onClick={onSwitch}
          >
            Switch
          </Button>
        )}
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-white/50">Balance:</span>
          <span className="ml-1 text-white font-medium">{formattedBalance} XLM</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onFund}
            disabled={isLoading}
          >
            <PiggyBank className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-white/40 truncate">
        {account.publicKey}
      </div>
    </motion.div>
  );
}
