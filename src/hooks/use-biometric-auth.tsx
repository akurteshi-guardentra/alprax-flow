
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BiometricAuthState {
  isBiometricAvailable: boolean;
  isRegistered: boolean;
  isSupported: boolean;
  loading: boolean;
  error: string | null;
}

interface BiometricAuthResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export const useBiometricAuth = () => {
  const [state, setState] = useState<BiometricAuthState>({
    isBiometricAvailable: false,
    isRegistered: false,
    isSupported: false,
    loading: true,
    error: null
  });

  // Check if the browser supports WebAuthn
  const checkBiometricSupport = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    
    try {
      // Check if the platform authenticator is available
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  };

  // Initialize biometric authentication on component mount
  useEffect(() => {
    const initBiometricAuth = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const isSupported = await checkBiometricSupport();
        
        setState({
          isBiometricAvailable: isSupported,
          isRegistered: false, // Simplified - would need database check
          isSupported,
          loading: false,
          error: isSupported ? null : 'Biometric authentication is not supported on this device'
        });
      } catch (error: any) {
        setState({
          isBiometricAvailable: false,
          isRegistered: false,
          isSupported: false,
          loading: false,
          error: error.message || 'Failed to initialize biometric authentication'
        });
      }
    };
    
    initBiometricAuth();
  }, []);

  // Register a new biometric credential
  const register = async (): Promise<BiometricAuthResult> => {
    try {
      // Simplified registration - would need backend integration
      return { 
        success: false, 
        message: 'Biometric registration requires backend setup' 
      };
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      return { 
        success: false, 
        message: 'Failed to register biometric authentication',
        error 
      };
    }
  };

  // Authenticate using biometric credentials
  const authenticate = async (): Promise<BiometricAuthResult> => {
    try {
      // Simplified authentication - would need backend integration
      return { 
        success: false, 
        message: 'Biometric authentication requires backend setup' 
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        message: 'Biometric authentication failed',
        error 
      };
    }
  };
  
  // Deregister biometric credentials
  const deregister = async (): Promise<BiometricAuthResult> => {
    try {
      // Simplified deregistration - would need backend integration
      setState(prev => ({ ...prev, isRegistered: false }));
      
      return { 
        success: true, 
        message: 'Biometric credentials removed successfully' 
      };
    } catch (error: any) {
      console.error('Deregistration error:', error);
      return { 
        success: false, 
        message: 'Failed to remove biometric credentials',
        error 
      };
    }
  };
  
  return {
    ...state,
    register,
    authenticate,
    deregister
  };
};
