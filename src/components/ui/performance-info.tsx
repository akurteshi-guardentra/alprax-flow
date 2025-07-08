import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePerformanceMetrics } from '@/hooks/use-performance-metrics';
import { performanceProfiler } from '@/utils/performance-profiler';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceInfoProps {
  showAdvanced?: boolean;
}

export function PerformanceInfo({ showAdvanced = false }: PerformanceInfoProps) {
  const { metrics } = usePerformanceMetrics();
  const [profilerData, setProfilerData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showAdvanced) {
      const interval = setInterval(() => {
        setProfilerData(performanceProfiler.exportData());
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [showAdvanced]);

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (usage: number) => {
    if (usage < 0.7) return 'text-green-400';
    if (usage < 0.9) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible && !showAdvanced) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 bg-black/80 text-white hover:bg-black/90"
      >
        <Activity className="w-4 h-4 mr-1" />
        Perf
      </Button>
    );
  }

  return (
    <Card className={`${showAdvanced ? '' : 'fixed bottom-20 right-4 z-50'} w-80 bg-black/90 border-white/20`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance
          </CardTitle>
          {!showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/70">FPS:</span>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70">Render:</span>
            <span className="text-white">{metrics.renderTime.toFixed(1)}ms</span>
          </div>
          
          {metrics.memoryUsage > 0 && (
            <div className="flex items-center justify-between col-span-2">
              <span className="text-white/70">Memory:</span>
              <span className={getMemoryColor(metrics.memoryUsage)}>
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Performance Status */}
        <div className="flex items-center gap-2">
          {metrics.isLowPerformance ? (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low Performance
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs bg-green-600">
              <Zap className="w-3 h-3 mr-1" />
              Good Performance
            </Badge>
          )}
        </div>

        {/* Advanced Metrics */}
        {showAdvanced && profilerData && (
          <div className="space-y-2 pt-2 border-t border-white/20">
            <div className="text-xs text-white/70">
              Slow Operations: {profilerData.summary.slowOperations.length}
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-white/70">Avg Render:</span>
                <span className="text-white">{profilerData.summary.averageRender.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Avg API:</span>
                <span className="text-white">{profilerData.summary.averageApi.toFixed(1)}ms</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                performanceProfiler.clear();
                console.log('Performance data cleared');
              }}
              className="w-full text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Clear Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}