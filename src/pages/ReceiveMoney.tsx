import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useUserAccount } from "@/hooks/useUserAccount";
import QRCode from "qrcode";

const ReceiveMoney = () => {
  const navigate = useNavigate();
  const { accountId, isLoading } = useUserAccount();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (accountId) {
      generateQRCode(accountId);
    }
  }, [accountId]);

  const generateQRCode = async (address: string) => {
    try {
      const url = await QRCode.toDataURL(address, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('QR code generation error:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!accountId) return;
    
    try {
      await navigator.clipboard.writeText(accountId);
      toast.success("Account ID copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy Account ID");
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = 'account-qr-code.png';
    link.href = qrCodeUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center glass-card">
          <CardTitle className="text-white mb-4">Account Not Found</CardTitle>
          <CardContent>
            <p className="text-white/70 mb-4">Please set up your account first</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <QrCode className="h-6 w-6" />
                Receive Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-white/70">
                Share your Account ID or QR code to receive payments
              </p>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64" />
                  </div>
                </div>
              )}

              {/* Account ID */}
              <div className="space-y-2">
                <p className="text-sm text-white/70">Your Account ID</p>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm break-all">
                    {accountId}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
                <Button
                  onClick={downloadQRCode}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  disabled={!qrCodeUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-white/70">
                  💡 <strong>Tip:</strong> Anyone with your Account ID can send you money. Always verify the sender and amount before confirming receipt.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiveMoney;
