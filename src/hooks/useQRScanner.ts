import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';

export interface QRScanResult {
  data: string;
  timestamp: number;
}

export interface QRScannerHook {
  isScanning: boolean;
  scanResult: QRScanResult | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  resetResult: () => void;
}

export function useQRScanner(): QRScannerHook {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      setScanResult({
        data: code.data,
        timestamp: Date.now()
      });
      setIsScanning(false);
      stopScanning();
      toast.success('QR Code scanned successfully!');
    } else {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanning]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      // Create video element if it doesn't exist
      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
      }

      videoRef.current.srcObject = stream;
      setIsScanning(true);

      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('QR Scanner error:', err);
    }
  }, [scanFrame]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetResult = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    resetResult
  };
}