import { useState } from 'react';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { RecipientSelector } from '@/components/RecipientSelector';
import { FavoriteRecipient } from '@/types/favoriteRecipient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function PaymentTest() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<FavoriteRecipient | null>(null);
  const [amount, setAmount] = useState('10.00');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  
  const handleSelectRecipient = (recipient: FavoriteRecipient) => {
    setSelectedRecipient(recipient);
  };
  
  const handlePaymentComplete = () => {
    setIsPaymentComplete(true);
    toast.success('Payment completed successfully!');
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(value);
  };
  
  const getAmountInCents = () => {
    return Math.round(parseFloat(amount || '0') * 100);
  };
  
  const resetForm = () => {
    setSelectedPaymentMethod('');
    setSelectedRecipient(null);
    setAmount('10.00');
    setIsPaymentComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment Test</h1>
        
        {isPaymentComplete ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/20 border border-green-700/30 rounded-xl p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-green-200/80 mb-6">
              Your payment of ${amount} has been processed successfully.
            </p>
            <Button onClick={resetForm} className="bg-white/10 hover:bg-white/20 text-white">
              Make Another Payment
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-lg font-medium mb-4">1. Select Recipient</h2>
              <RecipientSelector onSelectRecipient={handleSelectRecipient} />
            </div>
            
            {selectedRecipient && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
              >
                <h2 className="text-lg font-medium mb-4">2. Enter Amount</h2>
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-white/70">$</span>
                    <Input
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-8 bg-white/10 border-white/10 text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {selectedRecipient && amount && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
              >
                <h2 className="text-lg font-medium mb-4">3. Select Payment Method</h2>
                <PaymentMethodSelector 
                  selected={selectedPaymentMethod} 
                  onSelect={setSelectedPaymentMethod}
                  amount={getAmountInCents()}
                  onPaymentComplete={handlePaymentComplete}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
