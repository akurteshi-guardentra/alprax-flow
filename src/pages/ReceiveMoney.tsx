import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

const ReceiveMoney = () => {
  const navigate = useNavigate();
  const [publicKey, setPublicKey] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStellarAccount();
  }, []);

  const fetchStellarAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: account } = await supabase
        .from('stellar_accounts')
        .select('public_key')
        .eq('user_id', user.id)
        .single();

      if (account?.public_key) {
        setPublicKey(account.public_key);
        generateQRCode(account.public_key);
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      toast.error("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

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
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.success("Address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = 'stellar-address-qr.png';
    link.href = qrCodeUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
                Share your Stellar address or QR code to receive payments
              </p>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                  </div>
                </div>
              )}

              {/* Stellar Address */}
              <div className="space-y-2">
                <p className="text-sm text-white/70">Your Stellar Address</p>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm break-all">
                    {publicKey}
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
                  Copy Address
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
                  💡 <strong>Tip:</strong> Anyone can send you XLM or other Stellar assets using this address. Always verify the amount and sender before confirming receipt.
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
