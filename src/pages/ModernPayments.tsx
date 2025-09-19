import { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FiatPaymentForm } from '@/components/remittance/FiatPaymentForm';
import { PaymentWizard } from '@/components/payment-hub/PaymentWizard';
import { PaymentTemplates } from '@/components/payment-hub/PaymentTemplates';
import { PaymentErrorBoundary } from '@/components/payment/PaymentErrorBoundary';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { CreditCard, Zap, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ModernPayments = () => {
  const [activeTab, setActiveTab] = useState('quick');
  const isMobile = useIsMobile();

  const handleWizardComplete = () => {
    console.log('Payment wizard completed');
  };

  const handleTemplateUse = (template: any) => {
    console.log('Using template:', template);
    // Pre-fill payment form with template data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Send Money</h1>
          <p className="text-white/70">Choose your preferred payment method</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Pay
            </TabsTrigger>
            <TabsTrigger value="wizard" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Guided
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-6">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 overflow-hidden">
              <FiatPaymentForm />
            </div>
          </TabsContent>

          <TabsContent value="wizard" className="mt-6">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 overflow-hidden min-h-[600px]">
              <PaymentWizard onComplete={handleWizardComplete} />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6">
              <PaymentTemplates onUseTemplate={handleTemplateUse} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernPayments;