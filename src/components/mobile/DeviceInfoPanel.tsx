import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  Signal, 
  RotateCcw, 
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
import { useNetworkConditions } from '@/hooks/use-network-conditions';

interface DeviceInfo {
  platform: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  colorDepth: number;
  language: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
}

interface BatteryInfo {
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
}

export function DeviceInfoPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null
  });
  const [geolocation, setGeolocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null
  });

  const { connectionQuality, effectiveType } = useNetworkConditions();
  const { 
    orientation, 
    isSupported: orientationSupported, 
    portrait, 
    landscape,
    startListening: startOrientationListening
  } = useDeviceOrientation();

  useEffect(() => {
    collectDeviceInfo();
    getBatteryInfo();
    getGeolocation();
  }, []);

  const collectDeviceInfo = () => {
    const info: DeviceInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio,
      colorDepth: screen.colorDepth,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    };
    setDeviceInfo(info);
  };

  const getBatteryInfo = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        });

        // Listen for battery events
        battery.addEventListener('levelchange', () => {
          setBatteryInfo(prev => ({ 
            ...prev, 
            level: Math.round(battery.level * 100) 
          }));
        });

        battery.addEventListener('chargingchange', () => {
          setBatteryInfo(prev => ({ 
            ...prev, 
            charging: battery.charging 
          }));
        });
      }
    } catch (error) {
      console.log('Battery API not supported:', error);
    }
  };

  const getGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality as string) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'good':
        return <Signal className="w-4 h-4 text-blue-400" />;
      case 'moderate':
        return <Signal className="w-4 h-4 text-yellow-400" />;
      case 'poor':
        return <Signal className="w-4 h-4 text-red-400" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBatteryIcon = () => {
    if (batteryInfo.level === null) return <Battery className="w-4 h-4" />;
    
    const level = batteryInfo.level;
    let className = "w-4 h-4";
    
    if (level > 50) className += " text-green-400";
    else if (level > 20) className += " text-yellow-400";
    else className += " text-red-400";
    
    return <Battery className={className} />;
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-32 right-4 z-40 bg-black/80 text-white hover:bg-black/90"
      >
        <Smartphone className="w-4 h-4 mr-1" />
        Device
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed bottom-32 right-4 z-40 w-80"
    >
      <Card className="bg-black/90 border-white/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Device Info
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <EyeOff className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3 text-xs">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-white/70">
                {connectionQuality} ({effectiveType})
              </span>
            </div>
            
            {batteryInfo.level !== null && (
              <div className="flex items-center gap-2">
                {getBatteryIcon()}
                <span className="text-white/70">
                  {batteryInfo.level}% {batteryInfo.charging ? '⚡' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Screen & Device */}
          {deviceInfo && (
            <div className="space-y-1">
              <div className="text-white/50 text-xs font-medium">Screen</div>
              <div className="text-white/70">
                {deviceInfo.screenWidth} × {deviceInfo.screenHeight} 
                ({deviceInfo.pixelRatio}x)
              </div>
              <div className="text-white/70">
                {portrait ? 'Portrait' : 'Landscape'} • {deviceInfo.colorDepth}-bit
              </div>
            </div>
          )}

          {/* Orientation */}
          {orientationSupported && orientation && (
            <div className="space-y-1">
              <div className="text-white/50 text-xs font-medium">Orientation</div>
              <div className="grid grid-cols-3 gap-2 text-white/70">
                <div>α: {orientation.alpha?.toFixed(0)}°</div>
                <div>β: {orientation.beta?.toFixed(0)}°</div>
                <div>γ: {orientation.gamma?.toFixed(0)}°</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={startOrientationListening}
                className="text-xs text-blue-300 hover:text-blue-200"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Start Tracking
              </Button>
            </div>
          )}

          {/* Location */}
          {geolocation.latitude && (
            <div className="space-y-1">
              <div className="text-white/50 text-xs font-medium">Location</div>
              <div className="text-white/70 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {geolocation.latitude.toFixed(4)}, {geolocation.longitude?.toFixed(4)}
              </div>
              <div className="text-white/50">
                Accuracy: ±{geolocation.accuracy?.toFixed(0)}m
              </div>
            </div>
          )}

          {/* Capabilities */}
          <div className="space-y-1">
            <div className="text-white/50 text-xs font-medium">Capabilities</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {deviceInfo?.onlineStatus ? 'Online' : 'Offline'}
              </Badge>
              {batteryInfo.level !== null && (
                <Badge variant="secondary" className="text-xs">
                  Battery API
                </Badge>
              )}
              {orientationSupported && (
                <Badge variant="secondary" className="text-xs">
                  Orientation
                </Badge>
              )}
              {'geolocation' in navigator && (
                <Badge variant="secondary" className="text-xs">
                  GPS
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}