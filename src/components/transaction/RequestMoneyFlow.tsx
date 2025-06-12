
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Share2, Copy, ArrowLeft, Euro } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface RequestMoneyFlowProps {
  onBack: () => void;
}

export function RequestMoneyFlow({ onBack }: RequestMoneyFlowProps) {
  const [step, setStep] = useState<'form' | 'generated'>('form');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [requestLink, setRequestLink] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const handleGenerateRequest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const link = `https://alpraxflow.com/pay?amount=${amount}&description=${encodeURIComponent(description)}&to=current-user`;
    setRequestLink(link);

    try {
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    setStep('generated');
    toast.success('Payment request generated successfully!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(requestLink);
    toast.success('Payment link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Please send me €${amount}${description ? ` for ${description}` : ''}`,
          url: requestLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (step === 'generated') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep('form')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-white">Payment Request Generated</h2>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">€{amount}</div>
              {description && (
                <p className="text-white/70">{description}</p>
              )}
              
              {qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 bg-white p-4 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/70 text-sm break-all">{requestLink}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 border-white/20"
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Create Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold text-white">Request Money</h2>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-400" />
            Create Payment Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Amount</label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium">Description (Optional)</label>
            <Textarea
              placeholder="What is this payment for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateRequest}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-white text-blue-900 hover:bg-white/90"
          >
            Generate Payment Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
