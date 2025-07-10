// Production-ready debug panel for development and testing
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bug, ChevronDown, ChevronUp, Trash2, Download, AlertTriangle } from 'lucide-react';
import { errorTracker, type ErrorReport } from '@/utils/error-tracking';
import { ENV } from '@/config/environment';
import { useAuth } from '@/contexts/AuthContext';

interface DebugPanelProps {
  className?: string;
}

export function ProductionDebugPanel({ className }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [userActions, setUserActions] = useState<any[]>([]);
  const { user, session } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadDebugData();
    }
  }, [isOpen]);

  const loadDebugData = () => {
    // Load error reports
    const persistedErrors = errorTracker.getPersistedErrorReports();
    const memoryErrors = errorTracker.getErrorReports();
    setErrors([...persistedErrors, ...memoryErrors]);

    // Load user actions
    try {
      const actions = JSON.parse(localStorage.getItem('user_actions') || '[]');
      setUserActions(actions.slice(-20)); // Last 20 actions
    } catch {
      setUserActions([]);
    }
  };

  const clearAllData = () => {
    errorTracker.clearErrors();
    localStorage.removeItem('user_actions');
    setErrors([]);
    setUserActions([]);
  };

  const downloadDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      environment: {
        isDevelopment: ENV.isDevelopment,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      user: {
        id: user?.id,
        email: user?.email,
        authenticated: !!session
      },
      errors,
      userActions,
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        try {
          acc[key] = localStorage.getItem(key);
        } catch {
          acc[key] = '[Error reading value]';
        }
        return acc;
      }, {} as Record<string, string | null>)
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: ErrorReport['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Only show in development or when explicitly enabled
  if (!ENV.isDevelopment && !ENV.FEATURES.ENABLE_DEBUG_PANEL) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/80 border-white/20 text-white hover:bg-black/90"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug
            {errors.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {errors.length}
              </Badge>
            )}
            {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="w-96 max-h-96 mt-2 bg-black/90 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                Debug Panel
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadDebugData}
                    className="h-6 px-2 text-xs text-white/70 hover:text-white"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllData}
                    className="h-6 px-2 text-xs text-white/70 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environment Info */}
              <div>
                <h4 className="text-white text-xs font-medium mb-2">Environment</h4>
                <div className="space-y-1">
                  <Badge variant={ENV.isDevelopment ? 'secondary' : 'default'} className="text-xs">
                    {ENV.isDevelopment ? 'Development' : 'Production'}
                  </Badge>
                  <Badge variant={user ? 'default' : 'secondary'} className="text-xs ml-2">
                    {user ? 'Authenticated' : 'Guest'}
                  </Badge>
                </div>
              </div>

              {/* Error Reports */}
              {errors.length > 0 && (
                <div>
                  <h4 className="text-white text-xs font-medium mb-2 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Errors ({errors.length})
                  </h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {errors.slice(-5).reverse().map((error) => (
                        <div key={error.id} className="text-xs">
                          <div className="flex items-center justify-between">
                            <Badge variant={getSeverityColor(error.severity)} className="text-xs">
                              {error.severity}
                            </Badge>
                            <span className="text-white/50 text-xs">
                              {new Date(error.context.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-white/70 mt-1 truncate">{error.error.message}</p>
                          {error.context.component && (
                            <p className="text-white/50 text-xs">
                              Component: {error.context.component}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* User Actions */}
              {userActions.length > 0 && (
                <div>
                  <h4 className="text-white text-xs font-medium mb-2">Recent Actions</h4>
                  <ScrollArea className="h-20">
                    <div className="space-y-1">
                      {userActions.slice(-10).reverse().map((action, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">{action.action}</span>
                            <span className="text-white/50">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {errors.length === 0 && userActions.length === 0 && (
                <p className="text-white/50 text-xs text-center">No debug data available</p>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}