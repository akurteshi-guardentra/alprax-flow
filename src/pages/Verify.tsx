
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Smartphone, Globe, FileText, Bitcoin, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { UnifiedAppLayout } from "@/components/layout/UnifiedAppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VerificationStep = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  badgeText 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  onClick: () => void,
  badgeText?: string 
}) => (
  <motion.button
    onClick={onClick}
    className="w-full p-4 bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 transition-all duration-200 text-left"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start gap-4">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {badgeText && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-sm text-white/60 mt-1">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40 mt-2" />
    </div>
  </motion.button>
);

const Verify = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startVerification = async (type: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('verification_attempts')
        .insert({
          user_id: user.id,
          document_type: type,
          status: 'pending'
        });

      if (error) throw error;

      navigate('/verification/document');
    } catch (error) {
      console.error('Error starting verification:', error);
      toast.error('Failed to start verification process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedAppLayout title="Identity Verification" showBack>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <CardTitle className="text-white text-2xl">Enhanced Security Verification</CardTitle>
              <p className="text-white/70">
                Multi-layer verification system protects your account and ensures compliance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <VerificationStep
                icon={FileText}
                title="AI Document Verification"
                description="Our AI system verifies your passport or ID in seconds with 99.9% accuracy"
                onClick={() => startVerification('id_document')}
                badgeText="Recommended"
              />
              
              <VerificationStep
                icon={Smartphone}
                title="Biometric Verification"
                description="Secure verification through facial recognition or fingerprint"
                onClick={() => startVerification('biometric')}
              />
              
              <VerificationStep
                icon={Bitcoin}
                title="Web3 Wallet Verification"
                description="Connect your blockchain wallet for enhanced security and faster transfers"
                onClick={() => startVerification('web3_wallet')}
                badgeText="New"
              />
              
              <VerificationStep
                icon={Globe}
                title="Bank Account Verification"
                description="Link and verify your banking details securely"
                onClick={() => startVerification('bank_statement')}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">Advanced Security Protocols</h4>
                  <p className="text-sm text-blue-300/70 mt-1">
                    Enterprise-grade encryption and strict data protection. Your information is never shared and stored securely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedAppLayout>
  );
};

export default Verify;
