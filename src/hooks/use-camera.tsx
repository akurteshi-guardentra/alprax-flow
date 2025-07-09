import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface CameraResult {
  dataUrl: string;
  blob: Blob;
}

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkSupport = useCallback(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(supported);
    return supported;
  }, []);

  const startCamera = useCallback(async (options: CameraOptions = {}) => {
    if (!checkSupport()) {
      toast.error('Camera not supported on this device');
      return false;
    }

    try {
      const constraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: options.width || 1280,
          height: options.height || 720
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      hapticFeedback('light');
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Failed to access camera');
      return false;
    }
  }, [checkSupport]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    hapticFeedback('light');
  }, []);

  const capturePhoto = useCallback(async (): Promise<CameraResult | null> => {
    if (!videoRef.current || !isActive) {
      toast.error('Camera not active');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context.drawImage(videoRef.current, 0, 0);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            hapticFeedback('medium');
            resolve({ dataUrl, blob });
          } else {
            toast.error('Failed to capture photo');
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo');
      return null;
    }
  }, [isActive]);

  const switchCamera = useCallback(async () => {
    if (!isActive) return;

    const currentFacingMode = streamRef.current?.getVideoTracks()[0]?.getSettings()?.facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    stopCamera();
    await startCamera({ facingMode: newFacingMode });
  }, [isActive, stopCamera, startCamera]);

  return {
    isActive,
    isSupported,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    checkSupport
  };
}