
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Users, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { StepWizardPaymentFlow } from "./StepWizardPaymentFlow";
import { RequestMoneyFlow } from "./RequestMoneyFlow";
import { toast } from "sonner";

interface SimplifiedPaymentFlowProps {
  isMobile?: boolean;
}

export function SimplifiedPaymentFlow({ isMobile = false }: SimplifiedPaymentFlowProps) {
  const [view, setView] = useState<'home' | 'send' | 'request' | 'qr'>('home');

  if (view === 'send') {
    return <StepWizardPaymentFlow onBack={() => setView('home')} />;
  }

  if (view === 'request') {
    return <RequestMoneyFlow onBack={() => setView('home')} />;
  }

  if (view === 'qr') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setView('home')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h3 className="text-xl font-semibold text-white">QR Payment</h3>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">QR Code Payments</h4>
          <p className="text-white/70 mb-6">
            Scan QR codes to pay or generate your own for others to pay you. This feature is coming soon!
          </p>
          <Button
            onClick={() => {
              toast.info("QR code payments coming soon!");
              setView('home');
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Notify me when available
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Send Money</h3>
          <p className="text-white/70">Choose how you'd like to send money</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setView('send')}
              className="w-full h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/10 text-white justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Send to Contact</div>
                  <div className="text-sm text-white/70">Send money to anyone by name, email, or phone</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setView('qr')}
              className="w-full h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-white/10 text-white justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Scan QR Code</div>
                  <div className="text-sm text-white/70">Pay with QR code or generate one for others</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setView('request')}
              className="w-full h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-white/10 text-white justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Request Money</div>
                  <div className="text-sm text-white/70">Ask someone to send you money</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
            </Button>
          </motion.div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="text-blue-400 text-sm font-medium mb-1">💡 Quick Tip</div>
          <div className="text-white/90 text-sm">
            You can send money to anyone with just their name, email, or phone number. No need to know wallet addresses!
          </div>
        </div>
      </div>
    );
  }

  return null;
}
