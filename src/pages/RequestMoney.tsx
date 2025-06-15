
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, Copy, Share, QrCode } from "lucide-react";
import { toast } from "sonner";

const RequestMoney = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [requestLink, setRequestLink] = useState("");

  const handleGenerateRequest = () => {
    if (!amount || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    const link = `${window.location.origin}/pay?amount=${amount}&desc=${encodeURIComponent(description)}`;
    setRequestLink(link);
    toast.success("Payment request generated!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(requestLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/dashboard')}
      title="Request Money"
      subtitle="Generate a payment request link"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="glass-card modern-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-green-400" />
                Request Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white/90 text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="text-white/90 text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="What is this payment for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="modern-input"
                />
              </div>
              
              <Button 
                onClick={handleGenerateRequest}
                className="w-full premium-button"
              >
                Generate Payment Request
              </Button>
            </CardContent>
          </Card>

          {requestLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card modern-shadow border-green-500/25">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Payment Request Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg break-all text-white/80 text-sm">
                    {requestLink}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    
                    <Button 
                      onClick={() => navigator.share?.({ url: requestLink })}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default RequestMoney;
