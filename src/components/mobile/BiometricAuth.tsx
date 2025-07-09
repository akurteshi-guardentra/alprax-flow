import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedHaptics } from '@/hooks/use-advanced-haptics';
import { toast } from 'sonner';

interface BiometricAuthProps {
  onAuthenticated: (method: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

interface BiometricSupport {
  isAvailable: boolean;
  supportedMethods: string[];
  isConfigured: boolean;
}

export function BiometricAuth({ 
  onAuthenticated, 
  onCancel, 
  title = "Biometric Authentication",
  subtitle = "Verify your identity to continue"
}: BiometricAuthProps) {
  const [support, setSupport] = useState<BiometricSupport>({
    isAvailable: false,
    supportedMethods: [],
    isConfigured: false
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<string>('');
  
  const { patterns } = useAdvancedHaptics();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setSupport({
          isAvailable: false,
          supportedMethods: [],
          isConfigured: false
        });
        return;
      }

      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        // Simulate checking for configured biometrics
        // In a real app, you'd check with your backend
        const configured = localStorage.getItem('biometric_configured') === 'true';
        
        setSupport({
          isAvailable: true,
          supportedMethods: ['fingerprint', 'face'], // Simulated
          isConfigured: configured
        });
      } else {
        setSupport({
          isAvailable: false,
          supportedMethods: [],
          isConfigured: false
        });
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setSupport({
        isAvailable: false,
        supportedMethods: [],
        isConfigured: false
      });
    }
  };

  const authenticateWithBiometric = async (method: string) => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthMethod(method);
    patterns.tick();

    try {
      // Simulate biometric authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would use WebAuthn API
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        patterns.success();
        toast.success(`${method} authentication successful`);
        onAuthenticated(method);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      patterns.error();
      toast.error(`${method} authentication failed`);
      console.error('Biometric auth error:', error);
    } finally {
      setIsAuthenticating(false);
      setAuthMethod('');
    }
  };

  const getBiometricIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-8 h-8" />;
      case 'face':
        return <Eye className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  const getBiometricLabel = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Touch ID / Fingerprint';
      case 'face':
        return 'Face ID / Face Recognition';
      default:
        return 'Biometric';
    }
  };

  if (!support.isAvailable) {
    return (
      <Card className="max-w-sm mx-auto bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Biometric Not Available
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-white/70 text-sm">
            Biometric authentication is not supported or available on this device.
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              Continue Without Biometric
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!support.isConfigured) {
    return (
      <Card className="max-w-sm mx-auto bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-white/70 text-sm">
            Set up biometric authentication to enhance your account security.
          </p>
          <Button
            onClick={() => {
              localStorage.setItem('biometric_configured', 'true');
              checkBiometricSupport();
              toast.success('Biometric setup completed');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Set Up Biometric Auth
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              Skip Setup
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto bg-slate-900 border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-white">{title}</CardTitle>
        <p className="text-white/70 text-sm">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {support.supportedMethods.map((method) => (
            <motion.div
              key={method}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => authenticateWithBiometric(method)}
                disabled={isAuthenticating}
                className="w-full h-16 bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center gap-3"
              >
                <motion.div
                  animate={
                    isAuthenticating && authMethod === method
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }
                      : {}
                  }
                  transition={{
                    duration: 1,
                    repeat: isAuthenticating && authMethod === method ? Infinity : 0
                  }}
                  className="text-blue-400"
                >
                  {getBiometricIcon(method)}
                </motion.div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">
                    {getBiometricLabel(method)}
                  </p>
                  <p className="text-white/60 text-xs">
                    {isAuthenticating && authMethod === method
                      ? 'Authenticating...'
                      : 'Tap to authenticate'
                    }
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                  Ready
                </Badge>
              </Button>
            </motion.div>
          ))}
        </div>

        {onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full border-slate-600 text-white/70 hover:bg-slate-800"
            disabled={isAuthenticating}
          >
            Use Password Instead
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
          <Shield className="w-3 h-3" />
          <span>Secured with device biometrics</span>
        </div>
      </CardContent>
    </Card>
  );
}