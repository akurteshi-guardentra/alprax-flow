import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    if (window.PublicKeyCredential === undefined) {
      return false;
    }
    
    try {
      // Check if the platform authenticator is available
      // @ts-ignore - The property is not yet in the TypeScript definitions
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  };

  // Check if the user has registered biometric credentials
  const checkRegistrationStatus = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  };
  
  // Initialize biometric authentication on component mount
  useEffect(() => {
    const initBiometricAuth = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const isSupported = await checkBiometricSupport();
        
        if (isSupported) {
          const isRegistered = await checkRegistrationStatus();
          
          setState({
            isBiometricAvailable: true,
            isRegistered,
            isSupported: true,
            loading: false,
            error: null
          });
        } else {
          setState({
            isBiometricAvailable: false,
            isRegistered: false,
            isSupported: false,
            loading: false,
            error: 'Biometric authentication is not supported on this device'
          });
        }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Request challenge from server
      const response = await fetch('/api/auth/biometric/register/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) throw new Error('Failed to get registration challenge');
      
      const challenge = await response.json();
      
      // Convert base64 challenge to ArrayBuffer
      const publicKeyOptions = {
        challenge: Uint8Array.from(atob(challenge.challenge), c => c.charCodeAt(0)).buffer,
        rp: { name: 'Alprax', id: window.location.hostname },
        user: {
          id: Uint8Array.from(user.id, c => c.charCodeAt(0)).buffer,
          name: user.email || '',
          displayName: user.email || 'User'
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
      };
      
      // Create credential
      // @ts-ignore - The method may not be fully typed
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      });
      
      if (!credential) throw new Error('Failed to create credential');
      
      // Send verification to server
      const credentialResponse = await fetch('/api/auth/biometric/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              attestationObject: btoa(String.fromCharCode(...new Uint8Array(
                // @ts-ignore
                credential.response.attestationObject
              ))),
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(
                // @ts-ignore
                credential.response.clientDataJSON
              )))
            },
            type: credential.type,
          }
        })
      });
      
      if (!credentialResponse.ok) throw new Error('Failed to verify credential');
      
      setState(prev => ({ ...prev, isRegistered: true }));
      
      // Update user settings
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          biometric_auth: true,
          updated_at: new Date().toISOString()
        });
      
      return { success: true, message: 'Biometric authentication registered successfully' };
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Request challenge from server
      const response = await fetch('/api/auth/biometric/authenticate/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) throw new Error('Failed to get authentication challenge');
      
      const challenge = await response.json();
      
      // Convert base64 challenge to ArrayBuffer
      const publicKeyOptions = {
        challenge: Uint8Array.from(atob(challenge.challenge), c => c.charCodeAt(0)).buffer,
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      };
      
      // Get credential
      // @ts-ignore - The method may not be fully typed
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      });
      
      if (!credential) throw new Error('Failed to get credential');
      
      // Send verification to server
      const verifyResponse = await fetch('/api/auth/biometric/authenticate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          credentialId: credential.id,
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              authenticatorData: btoa(String.fromCharCode(...new Uint8Array(
                // @ts-ignore
                credential.response.authenticatorData
              ))),
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(
                // @ts-ignore
                credential.response.clientDataJSON
              ))),
              signature: btoa(String.fromCharCode(...new Uint8Array(
                // @ts-ignore
                credential.response.signature
              ))),
              userHandle: credential.response.userHandle ? 
                btoa(String.fromCharCode(...new Uint8Array(
                  // @ts-ignore
                  credential.response.userHandle
                ))) : null
            },
            type: credential.type
          }
        })
      });
      
      if (!verifyResponse.ok) throw new Error('Failed to verify authentication');
      
      return { success: true, message: 'Biometric authentication successful' };
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update user settings
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          biometric_auth: false,
          updated_at: new Date().toISOString()
        });
        
      setState(prev => ({ ...prev, isRegistered: false }));
      
      return { success: true, message: 'Biometric credentials removed successfully' };
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
