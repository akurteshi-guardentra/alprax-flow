
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Smartphone, Globe, FileText, AlertCircle, Bitcoin, Lock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

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
    className="w-full p-4 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-lg rounded-xl border border-white/[0.08] transition-all duration-200 text-left"
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
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1A2F] relative overflow-hidden">
      {/* Gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-2xl mx-auto relative px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Enhanced Security Verification</h1>
            <p className="text-white/60 max-w-md mx-auto">
              Our multi-layer identity verification system protects your account and ensures compliance with global regulations.
            </p>
          </div>

          <div className="mt-8 space-y-4">
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
          </div>

          <div className="mt-8 p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/20">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">Advanced Security Protocols</h4>
                <p className="text-sm text-blue-300/70 mt-1">
                  Our verification process uses enterprise-grade encryption and follows strict data protection guidelines. Your information is never shared with third parties and is stored using secure, encrypted methods.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;
