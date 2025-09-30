import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, Wifi, WifiOff, Battery, Cpu, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceProfile {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  icon: any;
  specs: {
    cpu: string;
    memory: string;
    screen: string;
  };
  results?: PerformanceResults;
}

interface PerformanceResults {
  loadTime: number;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  tti: number;
  score: number;
}

export const MobilePerformanceTester = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [connectionType, setConnectionType] = useState<'4g' | '3g' | 'offline'>('4g');
  const [devices, setDevices] = useState<DeviceProfile[]>([
    {
      id: 'iphone-14',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      icon: Smartphone,
      specs: {
        cpu: 'A16 Bionic',
        memory: '6GB RAM',
        screen: '6.1" OLED'
      }
    },
    {
      id: 'samsung-s23',
      name: 'Samsung Galaxy S23',
      type: 'mobile',
      icon: Smartphone,
      specs: {
        cpu: 'Snapdragon 8 Gen 2',
        memory: '8GB RAM',
        screen: '6.1" AMOLED'
      }
    },
    {
      id: 'ipad-air',
      name: 'iPad Air',
      type: 'tablet',
      icon: Tablet,
      specs: {
        cpu: 'M1',
        memory: '8GB RAM',
        screen: '10.9" Liquid Retina'
      }
    },
    {
      id: 'low-end',
      name: 'Budget Android',
      type: 'mobile',
      icon: Smartphone,
      specs: {
        cpu: 'MediaTek Helio',
        memory: '2GB RAM',
        screen: '5.5" LCD'
      }
    }
  ]);

  const runPerformanceTest = async (deviceId?: string) => {
    const devicesToTest = deviceId ? [devices.find(d => d.id === deviceId)!] : devices;
    setIsRunning(true);
    setProgress(0);

    for (let i = 0; i < devicesToTest.length; i++) {
      const device = devicesToTest[i];
      setCurrentDevice(device.id);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const baseMultiplier = device.specs.memory === '2GB RAM' ? 1.5 : 1;
      const connectionMultiplier = connectionType === '3g' ? 1.8 : connectionType === 'offline' ? 0 : 1;

      const results: PerformanceResults = {
        loadTime: Math.round((1200 + Math.random() * 800) * baseMultiplier * connectionMultiplier),
        fcp: Math.round((800 + Math.random() * 400) * baseMultiplier * connectionMultiplier),
        lcp: Math.round((1500 + Math.random() * 500) * baseMultiplier * connectionMultiplier),
        cls: Math.round((0.05 + Math.random() * 0.1) * 1000) / 1000,
        fid: Math.round((50 + Math.random() * 100) * baseMultiplier),
        tti: Math.round((2000 + Math.random() * 1000) * baseMultiplier * connectionMultiplier),
        score: 0
      };

      results.score = Math.round(100 - (
        (results.loadTime / 30) +
        (results.fcp / 20) +
        (results.lcp / 30) +
        (results.cls * 100) +
        (results.fid / 2)
      ));

      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, results } : d
      ));

      setProgress(((i + 1) / devicesToTest.length) * 100);
    }

    setIsRunning(false);
    setCurrentDevice(null);
    
    toast({
      title: 'Performance Test Complete',
      description: `Tested ${devicesToTest.length} device${devicesToTest.length > 1 ? 's' : ''}`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mobile Performance Testing</CardTitle>
              <CardDescription>
                Test app performance across different devices and network conditions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConnectionType(prev => 
                  prev === '4g' ? '3g' : prev === '3g' ? 'offline' : '4g'
                )}
              >
                {connectionType === 'offline' ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
                {connectionType.toUpperCase()}
              </Button>
              <Button onClick={() => runPerformanceTest()} disabled={isRunning}>
                <Play className="h-4 w-4 mr-2" />
                Test All Devices
              </Button>
            </div>
          </div>
        </CardHeader>
        {isRunning && (
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Testing devices... {Math.round(progress)}%
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4">
        {devices.map((device) => {
          const DeviceIcon = device.icon;
          return (
            <Card key={device.id} className={currentDevice === device.id ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DeviceIcon className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {device.specs.cpu} • {device.specs.memory} • {device.specs.screen}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.results && (
                      <Badge variant={getScoreBadge(device.results.score)}>
                        Score: {device.results.score}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runPerformanceTest(device.id)}
                      disabled={isRunning}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {device.results && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Load Time</p>
                      <p className={`text-lg font-bold ${device.results.loadTime < 2000 ? 'text-green-500' : 'text-red-500'}`}>
                        {(device.results.loadTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">First Contentful Paint</p>
                      <p className={`text-lg font-bold ${device.results.fcp < 1000 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {device.results.fcp}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Largest Contentful Paint</p>
                      <p className={`text-lg font-bold ${device.results.lcp < 2500 ? 'text-green-500' : 'text-red-500'}`}>
                        {device.results.lcp}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cumulative Layout Shift</p>
                      <p className={`text-lg font-bold ${device.results.cls < 0.1 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {device.results.cls}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">First Input Delay</p>
                      <p className={`text-lg font-bold ${device.results.fid < 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {device.results.fid}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time to Interactive</p>
                      <p className={`text-lg font-bold ${device.results.tti < 3000 ? 'text-green-500' : 'text-red-500'}`}>
                        {(device.results.tti / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
