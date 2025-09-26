import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  Database, 
  RotateCw as Sync,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface OfflineTask {
  id: string;
  type: 'transaction' | 'profile_update' | 'favorite_add' | 'data_sync';
  description: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
}

interface CacheData {
  key: string;
  size: number;
  lastAccessed: Date;
  hitCount: number;
  type: 'static' | 'api' | 'image' | 'transaction';
}

export function OfflineFunctionality() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<OfflineTask[]>([
    {
      id: '1',
      type: 'transaction',
      description: 'Send 100 XLM to GABC...XYZ',
      data: { amount: 100, recipient: 'GABC...XYZ' },
      timestamp: new Date(Date.now() - 300000),
      status: 'pending',
      retryCount: 0
    },
    {
      id: '2',
      type: 'profile_update',
      description: 'Update display name to "John Doe"',
      data: { displayName: 'John Doe' },
      timestamp: new Date(Date.now() - 150000),
      status: 'syncing',
      retryCount: 1
    }
  ]);

  const [cacheData] = useState<CacheData[]>([
    {
      key: 'user-profile',
      size: 2.4,
      lastAccessed: new Date(),
      hitCount: 142,
      type: 'api'
    },
    {
      key: 'transaction-history',
      size: 15.8,
      lastAccessed: new Date(Date.now() - 60000),
      hitCount: 89,
      type: 'api'
    },
    {
      key: 'static-assets',
      size: 234.6,
      lastAccessed: new Date(Date.now() - 120000),
      hitCount: 312,
      type: 'static'
    },
    {
      key: 'stellar-rates',
      size: 1.2,
      lastAccessed: new Date(Date.now() - 300000),
      hitCount: 56,
      type: 'api'
    }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const totalCacheSize = cacheData.reduce((sum, item) => sum + item.size, 0);
  const totalHits = cacheData.reduce((sum, item) => sum + item.hitCount, 0);

  const syncPendingTasks = () => {
    setPendingTasks(tasks =>
      tasks.map(task => ({
        ...task,
        status: task.status === 'pending' ? 'syncing' : task.status
      }))
    );

    // Simulate sync completion after delay
    setTimeout(() => {
      setPendingTasks(tasks =>
        tasks.map(task => ({
          ...task,
          status: task.status === 'syncing' ? 'completed' : task.status
        }))
      );
    }, 2000);
  };

  const clearCache = () => {
    // In a real implementation, this would clear the service worker cache
    console.log('Cache cleared');
  };

  const getStatusIcon = (status: OfflineTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'syncing':
        return <Sync className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: OfflineTask['status']) => {
    const variants = {
      pending: 'secondary',
      syncing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offline Functionality</h2>
          <p className="text-muted-foreground">
            Manage offline capabilities and cached data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-success" />
            ) : (
              <WifiOff className="h-5 w-5 text-destructive" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={offlineEnabled} 
              onCheckedChange={setOfflineEnabled}
            />
            <span className="text-sm">Enable Offline Mode</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'All features available' : 'Limited functionality'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCacheSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              {cacheData.length} cached items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHits}</div>
            <p className="text-xs text-muted-foreground">
              Total cache hits
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Background Sync</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="settings">Offline Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="h-5 w-5" />
                Background Sync Tasks
              </CardTitle>
              <CardDescription>
                Tasks queued for synchronization when connection is restored
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending tasks
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-semibold">{task.description}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        Type: {task.type.replace('_', ' ')} • Retries: {task.retryCount}
                      </div>

                      {task.status === 'syncing' && (
                        <div className="mt-2">
                          <Progress value={66} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Syncing...
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={syncPendingTasks}
                    disabled={!isOnline || pendingTasks.every(t => t.status !== 'pending')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Sync All Tasks
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Offline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Management
              </CardTitle>
              <CardDescription>
                Manage cached data for offline functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheData.map((item) => (
                  <div key={item.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{item.key}</h3>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {item.size.toFixed(1)} MB
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Accessed:</span>
                        <div>{item.lastAccessed.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache Hits:</span>
                        <div>{item.hitCount}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Cache Usage</span>
                    <span className="font-bold">{totalCacheSize.toFixed(1)} MB</span>
                  </div>
                  <Progress value={Math.min((totalCacheSize / 500) * 100, 100)} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {totalCacheSize.toFixed(1)} MB of 500 MB used
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCache}>
                    Clear Cache
                  </Button>
                  <Button variant="outline">
                    Optimize Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Offline Settings</CardTitle>
              <CardDescription>
                Configure offline functionality and data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Offline Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow the app to work without internet connection
                    </p>
                  </div>
                  <Switch checked={offlineEnabled} onCheckedChange={setOfflineEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-sync on Connection</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync pending tasks when online
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cache Transaction History</h4>
                    <p className="text-sm text-muted-foreground">
                      Store transaction history locally for offline viewing
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Offline Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Show notifications when connection is lost/restored
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Cache Retention</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    How long to keep cached data when offline
                  </p>
                  <div className="grid gap-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="retention" defaultChecked />
                      <span className="text-sm">7 days</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="retention" />
                      <span className="text-sm">30 days</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="retention" />
                      <span className="text-sm">Until manually cleared</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}