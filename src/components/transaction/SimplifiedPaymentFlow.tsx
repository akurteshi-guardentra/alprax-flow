
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, UserPlus, QrCode, Users } from 'lucide-react';
import { StepWizardPaymentFlow } from './StepWizardPaymentFlow';
import { RequestMoneyFlow } from './RequestMoneyFlow';
import { QRCodeScanner } from './QRCodeScanner';
import { motion } from 'framer-motion';

type FlowType = 'menu' | 'send' | 'request' | 'scan';

export function SimplifiedPaymentFlow() {
  const [currentFlow, setCurrentFlow] = useState<FlowType>('menu');

  const handleQRScan = (data: string) => {
    console.log('QR Code scanned:', data);
    // Process the QR code data and navigate to appropriate flow
    setCurrentFlow('send');
  };

  if (currentFlow === 'send') {
    return <StepWizardPaymentFlow onBack={() => setCurrentFlow('menu')} />;
  }

  if (currentFlow === 'request') {
    return <RequestMoneyFlow onBack={() => setCurrentFlow('menu')} />;
  }

  return (
    <div className="space-y-6">
      <QRCodeScanner
        isOpen={currentFlow === 'scan'}
        onScan={handleQRScan}
        onClose={() => setCurrentFlow('menu')}
      />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Send & Request Money</h2>
        <p className="text-white/70">Choose how you'd like to transfer money</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full"
            onClick={() => setCurrentFlow('send')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Send className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Send to Contact</h3>
              <p className="text-white/70 text-sm">Send money to friends and family instantly</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full"
            onClick={() => setCurrentFlow('request')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Request Money</h3>
              <p className="text-white/70 text-sm">Create a payment request with QR code</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full"
            onClick={() => setCurrentFlow('scan')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <QrCode className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
              <p className="text-white/70 text-sm">Scan to pay or receive payment requests</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Split Bill</h3>
              <p className="text-white/70 text-sm">Split expenses with multiple people</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
