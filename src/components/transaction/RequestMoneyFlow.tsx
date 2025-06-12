
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Share, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";

interface RequestMoneyFlowProps {
  onBack: () => void;
}

export function RequestMoneyFlow({ onBack }: RequestMoneyFlowProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [requestCreated, setRequestCreated] = useState(false);

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanValue);
  };

  const generateRequestLink = () => {
    const baseUrl = "https://pay.alprax.app/request";
    const params = new URLSearchParams();
    if (amount) params.append("amount", amount);
    if (description) params.append("desc", description);
    params.append("currency", "EUR");
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCreateRequest = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setRequestCreated(true);
    hapticFeedback("success");
    toast.success("Payment request created!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateRequestLink());
    setCopied(true);
    toast.success("Payment link copied to clipboard");
    hapticFeedback("light");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRequest = () => {
    if (navigator.share) {
      navigator.share({
        title: "Payment Request",
        text: `Please send me ${amount} EUR${description ? ` for ${description}` : ''}`,
        url: generateRequestLink()
      });
    } else {
      copyToClipboard();
    }
  };

  if (requestCreated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setRequestCreated(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edit Request
          </Button>
          <h3 className="text-xl font-semibold text-white">Payment Request Created</h3>
        </div>

        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-400" />
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2">Request Details</h4>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Amount:</span>
                <span className="text-white font-medium">{amount} EUR</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-white/70">For:</span>
                  <span className="text-white">{description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={copyToClipboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Payment Link'}
            </Button>

            <Button
              onClick={shareRequest}
              variant="outline"
              className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Request
            </Button>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </div>

          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 text-sm">
              💡 Share this link with anyone to request payment. They can pay using any supported payment method.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h3 className="text-xl font-semibold text-white">Request Money</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label className="text-white">Amount (EUR)</Label>
          <div className="relative">
            <Input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="bg-white/10 border-white/20 text-white text-lg pr-16 h-12"
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center">
              <span className="text-white/60 font-medium">EUR</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">What is this request for? (Optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner split, Concert tickets, Rent..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[80px]"
          />
        </div>

        {amount && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-white font-medium mb-2">Preview</h4>
            <p className="text-white/80">
              Request for <span className="font-semibold">{amount} EUR</span>
              {description && <span> for {description}</span>}
            </p>
          </div>
        )}

        <Button
          onClick={handleCreateRequest}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
        >
          Create Payment Request
        </Button>

        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="text-sm text-orange-200">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 text-orange-200/80">
              <li>• Create a payment request with the amount you need</li>
              <li>• Share the link with the person who should pay you</li>
              <li>• They can pay using their preferred payment method</li>
              <li>• You'll receive the funds directly to your account</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
