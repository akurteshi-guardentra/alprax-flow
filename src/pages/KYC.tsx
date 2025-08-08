
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Check, Clock, AlertTriangle, Shield, Info } from "lucide-react";
import KYCVerificationForm from "@/components/kyc/KYCVerificationForm";
import KYCStatus from "@/components/kyc/KYCStatus";
import AdminKYCVerification from "@/components/kyc/AdminKYCVerification";
import { useEffect, useState } from "react";
import { useKYC } from "@/hooks/useKYC";
import OnfidoKYC from "@/components/kyc/OnfidoKYC";

const KYC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [useProFlow, setUseProFlow] = useState(false);
  const { 
    status, 
    documents, 
    isLoading, 
    error,
    uploadDocument,
    refreshKYCStatus,
    cancelVerification
  } = useKYC();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsAdmin(false);
    };
    
    checkAdminStatus();
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
            
            <motion.div 
              className="text-center text-white bg-green-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-green-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/30 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">KYC Verification Complete</h2>
              <p className="text-white/80">Your identity has been verified. You now have full access to all features.</p>
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        );
      case 'pending':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
            
            <motion.div 
              className="text-center text-white bg-yellow-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-yellow-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/30 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification In Progress</h2>
              <p className="text-white/80">Your verification is being processed. This usually takes 1-2 business days.</p>
              {documents.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-white/60 mb-2">Submitted {new Date(documents[0].submitted_at).toLocaleDateString()}</p>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => cancelVerification(documents[0].id)}
                  >
                    Cancel Verification
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        );
      case 'rejected':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
          
            <motion.div 
              className="text-white bg-red-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-red-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verification Rejected</h2>
              </div>
              
              <div className="mt-4 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h3 className="text-white font-medium mb-1">Reason for Rejection:</h3>
                <p className="text-white/80">
                  {documents.length > 0 && documents[0].rejection_reason ? 
                    documents[0].rejection_reason : 
                    "Your verification was rejected. Please try again with valid documents."
                  }
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={() => refreshKYCStatus()} className="bg-primary hover:bg-primary/90 text-white">
                  Try Again
                </Button>
              </div>
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="max-w-lg mx-auto">
            <div className="mb-6">
              <KYCStatus showActionButton={false} />
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Button
                variant={useProFlow ? "outline" : "default"}
                onClick={() => setUseProFlow(false)}
                className="flex-1"
              >
                Basic Upload
              </Button>
              <Button
                variant={useProFlow ? "default" : "outline"}
                onClick={() => setUseProFlow(true)}
                className="flex-1"
              >
                Pro Verification
              </Button>
            </div>

            {useProFlow ? (
              <OnfidoKYC onCompleted={refreshKYCStatus} />
            ) : (
              <KYCVerificationForm onSubmit={uploadDocument} />
            )}

            <p className="mt-3 text-xs text-white/70">
              Pro Verification uses Onfido for instant checks with liveness & fraud signals.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
          className="pt-20"
        >
          {isLoading ? (
            <div className="max-w-lg mx-auto text-center p-10">
              <div className="animate-pulse space-y-4">
                <div className="h-24 w-24 bg-white/10 rounded-full mx-auto"></div>
                <div className="h-8 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
                <div className="h-4 bg-white/10 rounded-lg w-2/4 mx-auto"></div>
                <div className="h-4 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
                <div className="h-10 bg-white/10 rounded-lg w-1/3 mx-auto mt-6"></div>
              </div>
            </div>
          ) : isAdmin ? (
            <AdminKYCVerification />
          ) : (
            getStatusDisplay()
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default KYC;
