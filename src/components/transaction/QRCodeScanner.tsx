
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScan, onClose, isOpen }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    } else if (!isOpen && streamRef.current) {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simulate QR code detection (in real app, you'd use a QR code library)
      setTimeout(() => {
        // For demo purposes, simulate a successful scan
        const mockQRData = "alpraxflow://pay?to=john.doe@example.com&amount=50&currency=EUR";
        handleScan(mockQRData);
      }, 3000);

    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
      toast.error('Could not access camera');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = (data: string) => {
    stopScanning();
    onScan(data);
    onClose();
    toast.success('QR code scanned successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {error ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={startScanning}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : isScanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 rounded-lg"></div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    Point camera at QR code
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-white/70 mb-4">Position the QR code within the camera frame</p>
                <Button
                  onClick={startScanning}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
