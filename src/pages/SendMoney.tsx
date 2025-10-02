import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendPayment } from "@/lib/stellar/payment";
import { SimplifiedRecipientFinder } from "@/components/transaction/SimplifiedRecipientFinder";
import { FavoriteRecipient } from "@/types/favoriteRecipient";

const SendMoney = () => {
  const navigate = useNavigate();
  const [selectedRecipient, setSelectedRecipient] = useState<FavoriteRecipient | null>(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    // Validation
    if (!selectedRecipient) {
      toast.error("Please select a recipient");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing payment...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Get user's stellar account
      const { data: account } = await supabase
        .from('stellar_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .maybeSingle();

      if (!account) {
        toast.dismiss(toastId);
        toast.error("No Stellar account found. Please create one first.");
        return;
      }

      // Send payment
      const result = await sendPayment(
        selectedRecipient.stellar_address,
        amount,
        'XLM',
        selectedRecipient.recipient_name,
        selectedRecipient.id,
        memo,
        {
          recipient_country: selectedRecipient.country,
          transfer_purpose: 'personal',
          transfer_category: 'money_transfer'
        }
      );

      toast.dismiss(toastId);

      if (result.success) {
        toast.success(
          `Payment sent! ${result.txHash ? `TX: ${result.txHash.substring(0, 8)}...` : ''}`,
          { duration: 5000 }
        );
        
        // Wait a moment then navigate
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Show specific error messages
        if (result.errorType === 'insufficient_balance') {
          toast.error("Insufficient balance. Please add funds to your account.");
        } else if (result.errorType === 'account_not_found') {
          toast.error("Recipient account not found.");
        } else if (result.errorType === 'network_error') {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error(result.error || "Payment failed");
        }
      }
    } catch (error: any) {
      console.error('Send error:', error);
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to send payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="glass-card-hover text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card modern-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Send className="h-6 w-6" />
                Send Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <Label className="text-white">Select Recipient</Label>
                {selectedRecipient ? (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{selectedRecipient.recipient_name}</h3>
                        <p className="text-sm text-white/70">{selectedRecipient.country}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecipient(null)}
                        className="text-white/70"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <SimplifiedRecipientFinder onSelectRecipient={setSelectedRecipient} />
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Amount (XLM)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Memo Input */}
              <div className="space-y-2">
                <Label htmlFor="memo" className="text-white">Memo (Optional)</Label>
                <Input
                  id="memo"
                  placeholder="Add a note..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={loading || !selectedRecipient || !amount}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SendMoney;
