
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { QRCodeDisplay } from "@/components/auth/QRCodeDisplay";
import { SetupVerificationForm } from "@/components/auth/SetupVerificationForm";

const Setup2FA = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const secretKey = authenticator.generateSecret();
        setSecret(secretKey);
        
        const qrCodeDataUrl = await QRCode.toDataURL(
          `otpauth://totp/AlpraxApp:${user.email}?secret=${secretKey}&issuer=AlpraxApp`
        );
        setQrCodeUrl(qrCodeDataUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        toast.error("Failed to set up 2FA. Please try again.");
        setIsLoading(false);
      }
    };

    setup2FA();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const isValid = authenticator.verify({
        token: verificationCode,
        secret: secret
      });

      if (!isValid) {
        toast.error("Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('two_factor_auth')
        .insert({
          user_id: user.id,
          type: 'app',
          secret: secret,
          status: 'verified',
          verified_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("2FA has been successfully set up!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error("Failed to verify 2FA code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <Card className="p-8 bg-white/10 backdrop-blur-lg">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-full">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white">Setup 2FA</h2>
              <p className="text-white/80 mt-2">Secure your account with two-factor authentication</p>
            </motion.div>
          </div>
          
          <div className="mt-8">
            <QRCodeDisplay isLoading={isLoading} qrCodeUrl={qrCodeUrl} />
            
            {!isLoading && (
              <SetupVerificationForm
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Setup2FA;
