
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Share2, Copy, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface RequestMoneyFlowProps {
  onBack: () => void;
}

export function RequestMoneyFlow({ onBack }: RequestMoneyFlowProps) {
  const [step, setStep] = useState<'form' | 'share'>('form');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [requestUrl, setRequestUrl] = useState('');

  const handleCreateRequest = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Generate request URL
    const baseUrl = 'https://pay.alprax.app/request';
    const params = new URLSearchParams();
    params.append('amount', amount);
    params.append('currency', 'EUR');
    if (description) params.append('desc', description);
    params.append('to', 'your-stellar-address'); // This would be the user's address
    
    const url = `${baseUrl}?${params.toString()}`;
    setRequestUrl(url);
    setStep('share');
    toast.success('Payment request created!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(requestUrl);
      toast.success('Request link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareRequest = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request - AlpraxFlow',
          text: `I'm requesting ${amount} EUR${description ? ` for ${description}` : ''}`,
          url: requestUrl,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (step === 'share') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setStep('form')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h3 className="text-xl font-semibold text-white">Share Request</h3>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-green-400" />
              Payment Request Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-white mb-2">{amount} EUR</div>
              {description && (
                <div className="text-white/70">{description}</div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60 mb-1">Request Link:</div>
                <div className="text-white text-sm break-all">{requestUrl}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="text-center text-xs text-white/50">
              Anyone with this link can send you the requested amount
            </div>
          </CardContent>
        </Card>
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

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Create Payment Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Amount (EUR)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white/10 border-white/20 text-white"
              step="0.01"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this payment for?"
              className="bg-white/10 border-white/20 text-white resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreateRequest}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Create Request
          </Button>

          <div className="text-center text-xs text-white/50">
            Create a shareable link to request payment from anyone
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
