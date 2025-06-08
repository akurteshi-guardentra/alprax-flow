
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Check, Clock, AlertTriangle, Shield } from "lucide-react";
import KYCVerificationForm from "@/components/kyc/KYCVerificationForm";
import KYCStatus from "@/components/kyc/KYCStatus";
import AdminKYCVerification from "@/components/kyc/AdminKYCVerification";
import { useEffect, useState } from "react";
import { useKYC } from "@/hooks/useKYC";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { useMobile } from "@/hooks/use-mobile";
import { useDataSaverMode } from "@/hooks/use-data-saver";

const KYC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { 
    status, 
    documents, 
    isLoading, 
    error,
    uploadDocument,
    refreshKYCStatus,
    cancelVerification
  } = useKYC();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isLoadingWithFallback } = useNetworkAwareLoading(isLoading);
  const { isMobile } = useMobile();
  const { isLowEndDevice } = useDataSaverMode();

  useEffect(() => {
    // Admin check could be a separate hook or function
    const checkAdminStatus = async () => {
      // TODO: Implement proper admin check based on your auth model
      setIsAdmin(false);
    };
    
    checkAdminStatus();
  }, []);  const getStatusDisplay = () => {
    switch (status) {
      case 'approved':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
            
            <motion.div 
              className="text-center text-white bg-green-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-green-500/30"
              initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined} 
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition({ type: 'spring', stiffness: 300, damping: 25 })}
            >
              <div className={`${isLowEndDevice ? 'w-12 h-12' : 'w-16 h-16'} mx-auto rounded-full bg-green-500/30 flex items-center justify-center mb-4`}>
                <Check className={`${isLowEndDevice ? 'h-6 w-6' : 'h-8 w-8'} text-green-300`} />
              </div>
              <h2 className={`${isLowEndDevice ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>KYC Verification Complete</h2>
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
            
            {/* Verified account features */}
            {!isLowEndDevice && (
              <motion.div 
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition({ delay: 0.2 })}
              >
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-2">Higher Transaction Limits</h3>
                  <p className="text-white/70 text-sm">You can now perform larger transactions without additional verification.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-2">Advanced Features</h3>
                  <p className="text-white/70 text-sm">Access to premium features like batch transfers and currency exchange.</p>
                </div>
              </motion.div>
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
            
            <motion.div 
              className="text-center text-white bg-yellow-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-yellow-500/30"
              initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined} 
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition({ type: 'spring', stiffness: 300, damping: 25 })}
            >
              <div className={`${isLowEndDevice ? 'w-12 h-12' : 'w-16 h-16'} mx-auto rounded-full bg-yellow-500/30 flex items-center justify-center mb-4`}>
                <Clock className={`${isLowEndDevice ? 'h-6 w-6' : 'h-8 w-8'} text-yellow-300`} />
              </div>
              <h2 className={`${isLowEndDevice ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Verification In Progress</h2>
              <p className="text-white/80">Your verification request is being reviewed. We'll notify you once the process is complete.</p>
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
            
            {/* Expected completion info */}
            <motion.div 
              className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm"
              initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={getTransition({ delay: 0.2 })}
            >
              <h3 className="text-white font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-400" />
                Verification Timeline
              </h3>
              <p className="text-white/70 text-sm">Verification typically takes 1-2 business days to complete. You'll receive a notification once your documents have been reviewed.</p>
            </motion.div>
          </div>
        );
      case 'rejected':
        return (
          <div className="max-w-lg mx-auto">
            <KYCStatus showActionButton={false} />
          
            <motion.div 
              className="text-white bg-red-500/20 p-6 mt-6 rounded-xl backdrop-blur-sm border border-red-500/30"
              initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition({ type: 'spring', stiffness: 300, damping: 25 })}
            >
              <div className="text-center">
                <div className={`${isLowEndDevice ? 'w-12 h-12' : 'w-16 h-16'} mx-auto rounded-full bg-red-500/30 flex items-center justify-center mb-4`}>
                  <AlertTriangle className={`${isLowEndDevice ? 'h-6 w-6' : 'h-8 w-8'} text-red-300`} />
                </div>
                <h2 className={`${isLowEndDevice ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Verification Rejected</h2>
              </div>
              
              <div className="mt-4 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h3 className="text-white font-medium mb-1">Reason for Rejection:</h3>
                <p className="text-white/80">
                  {documents.length > 0 && documents[0].rejection_reason ? 
                    documents[0].rejection_reason : 
                    "Your verification was not approved. Please try again with valid documents."
                  }
                </p>
              </div>
              
              <div className="mt-4">
                <h3 className="text-white font-medium mb-2">What to do next:</h3>
                <ul className="space-y-2 text-white/80 text-sm pl-5">
                  <li>Ensure your documents are clearly visible and not expired</li>
                  <li>Make sure all four corners of your ID are visible</li>
                  <li>Upload a higher quality photo if the previous one was blurry</li>
                </ul>
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
            <KYCVerificationForm onSubmit={uploadDocument} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kosovo-blue via-kosovo-blue/90 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
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
          {isLoadingWithFallback ? (
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
