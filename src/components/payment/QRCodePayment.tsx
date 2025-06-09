
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QRCodePaymentProps {
  paymentUrl: string;
  amount?: string;
  recipientName?: string;
  onRefresh: () => void;
  className?: string;
}

export function QRCodePayment({
  paymentUrl,
  amount,
  recipientName,
  onRefresh,
  className
}: QRCodePaymentProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [paymentUrl]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const dataURL = await QRCode.toDataURL(paymentUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 280,
        color: {
          dark: '#ffffff',
          light: '#0f172a00'
        }
      });
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment QR Code',
          text: `Payment to ${recipientName || 'recipient'} for ${amount || 'specified amount'}`,
          url: paymentUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(paymentUrl);
      // Add toast notification here if available
      console.log('Payment URL copied to clipboard');
    }
  };

  return (
    <div className={cn("flex flex-col items-center p-6", className)}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-lg mb-6"
      >
        {isLoading ? (
          <div className="w-[280px] h-[280px] flex items-center justify-center">
            <div className="h-16 w-16 relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-t-2 border-purple-500 animate-spin animation-delay-150"></div>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
            <div className="relative bg-black rounded-xl p-1">
              <img 
                src={qrCodeDataURL} 
                alt="Payment QR Code" 
                className="w-[280px] h-[280px]" 
              />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center space-y-3 mb-8 w-full"
      >
        {recipientName && (
          <div className="bg-white/5 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10">
            <p className="text-white/80 text-sm">To: <span className="text-white font-medium">{recipientName}</span></p>
          </div>
        )}
        {amount && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md py-3 px-4 rounded-xl border border-white/10">
            <p className="text-white text-2xl font-bold">{amount}</p>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex gap-3 w-full"
      >
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          className="flex-1 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh QR
        </Button>
        <Button 
          onClick={handleShare} 
          variant="outline" 
          className="flex-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border-white/10 text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </motion.div>      <p className="text-white/50 text-xs mt-6 px-4 py-2 bg-black/30 rounded-lg backdrop-blur-md border border-white/5 flex items-center">
        <Info className="h-3 w-3 mr-1.5 text-blue-400" />
        Scan this QR code using any compatible payment app
        <ChevronRight className="h-3 w-3 ml-1 text-white/30" />
      </p>
    </div>
  );
}
