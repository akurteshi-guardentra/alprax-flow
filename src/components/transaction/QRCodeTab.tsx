
import { QRCodePayment } from "../payment/QRCodePayment";
import { QrCode } from "lucide-react";
import { motion } from "framer-motion";

interface QRCodeTabProps {
  paymentUrl: string;
  amount?: string;
  recipientName?: string;
}

export function QRCodeTab({ paymentUrl, amount, recipientName }: QRCodeTabProps) {
  return (
    <motion.div
      key="qr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg sm:text-xl font-semibold text-white">QR Code Payment</h3>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <QRCodePayment
          paymentUrl={paymentUrl}
          amount={amount}
          recipientName={recipientName}
          onRefresh={() => console.log("Refreshing QR code")}
        />
      </div>
    </motion.div>
  );
}
