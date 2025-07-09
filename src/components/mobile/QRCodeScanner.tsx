import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Flashlight, FlashlightOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { useAdvancedHaptics } from '@/hooks/use-advanced-haptics';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  className?: string;
}

export function QRCodeScanner({ isOpen, onClose, onScan, className }: QRCodeScannerProps) {
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [scanRegion, setScanRegion] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  
  const { 
    isActive, 
    isSupported, 
    videoRef, 
    startCamera, 
    stopCamera, 
    switchCamera 
  } = useCamera();
  
  const { patterns } = useAdvancedHaptics();

  useEffect(() => {
    if (isOpen && isSupported) {
      startCamera({ facingMode: 'environment' });
      setupScanRegion();
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isSupported, startCamera, stopCamera]);

  const setupScanRegion = () => {
    if (scannerRef.current) {
      const rect = scannerRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) * 0.6;
      setScanRegion({
        x: (rect.width - size) / 2,
        y: (rect.height - size) / 2,
        width: size,
        height: size
      });
    }
  };

  const toggleFlashlight = async () => {
    if (!isActive || !videoRef.current) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashlightOn } as any]
        });
        setIsFlashlightOn(!isFlashlightOn);
        patterns.tick();
      } else {
        toast.error('Flashlight not available');
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      toast.error('Failed to toggle flashlight');
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsFlashlightOn(false);
    onClose();
  };

  const simulateQRScan = () => {
    // For demo purposes - in real implementation, use a QR code library
    setTimeout(() => {
      patterns.success();
      onScan('STELLAR_ADDRESS_EXAMPLE_12345');
      handleClose();
    }, 2000);
  };

  useEffect(() => {
    if (isActive) {
      simulateQRScan();
    }
  }, [isActive]);

  if (!isSupported) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 max-w-sm mx-4">
              <h3 className="text-white text-lg font-semibold mb-2">Camera Not Available</h3>
              <p className="text-white/70 mb-4">
                Your device doesn't support camera access or it's not available in this context.
              </p>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={scannerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            "fixed inset-0 z-50 bg-black",
            className
          )}
        >
          {/* Video Stream */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-sm">
              <h2 className="text-white text-lg font-semibold">Scan QR Code</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scan Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scan Frame */}
                <motion.div
                  className="w-64 h-64 border-2 border-white/60 rounded-xl relative"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255, 255, 255, 0.4)',
                      '0 0 0 10px rgba(255, 255, 255, 0)',
                      '0 0 0 0 rgba(255, 255, 255, 0)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  {/* Corner Indicators */}
                  {[
                    { top: -2, left: -2 },
                    { top: -2, right: -2 },
                    { bottom: -2, left: -2 },
                    { bottom: -2, right: -2 }
                  ].map((position, index) => (
                    <div
                      key={index}
                      className="absolute w-6 h-6 border-2 border-blue-400"
                      style={{
                        ...position,
                        borderColor: index % 2 === 0 ? '#60a5fa' : '#34d399',
                        borderWidth: '3px',
                        borderRadius: '4px'
                      }}
                    />
                  ))}

                  {/* Scanning Line */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    animate={{
                      top: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </motion.div>

                <p className="text-white text-center mt-4 text-sm">
                  Position the QR code within the frame
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={switchCamera}
                className="bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-black/80"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Flip
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFlashlight}
                className="bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-black/80"
              >
                {isFlashlightOn ? (
                  <>
                    <FlashlightOff className="w-4 h-4 mr-2" />
                    Flash Off
                  </>
                ) : (
                  <>
                    <Flashlight className="w-4 h-4 mr-2" />
                    Flash On
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Hidden Canvas for QR Processing */}
          <canvas
            ref={canvasRef}
            className="hidden"
            width={320}
            height={240}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}