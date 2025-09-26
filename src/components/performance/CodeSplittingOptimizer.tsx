import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Package, Zap } from 'lucide-react';

// Lazy-loaded components for demonstration
const LazyDashboard = lazy(() => Promise.resolve({ default: () => <div>Dashboard Component</div> }));
const LazyProfile = lazy(() => Promise.resolve({ default: () => <div>Profile Component</div> }));
const LazyTransactions = lazy(() => Promise.resolve({ default: () => <div>Transactions Component</div> }));

interface BundleInfo {
  name: string;
  size: number;
  optimizedSize: number;
  loadTime: number;
  status: 'optimized' | 'needs-optimization' | 'critical';
  components: string[];
}

export function CodeSplittingOptimizer() {
  const bundleData: BundleInfo[] = [
    {
      name: 'Main Bundle',
      size: 245.6,
      optimizedSize: 187.2,
      loadTime: 1.2,
      status: 'optimized',
      components: ['App', 'Router', 'AuthProvider']
    },
    {
      name: 'Dashboard Chunk',
      size: 156.8,
      optimizedSize: 98.4,
      loadTime: 0.8,
      status: 'optimized',
      components: ['Dashboard', 'WalletOverview', 'TransactionList']
    },
    {
      name: 'Profile Chunk',
      size: 89.3,
      optimizedSize: 67.1,
      loadTime: 0.5,
      status: 'optimized',
      components: ['ProfileForm', 'SecuritySettings', 'BackupManager']
    },
    {
      name: 'Vendor Bundle',
      size: 512.7,
      optimizedSize: 398.9,
      loadTime: 2.1,
      status: 'needs-optimization',
      components: ['React', 'ReactDOM', 'StellarSDK', 'Lodash']
    },
    {
      name: 'UI Components',
      size: 178.4,
      optimizedSize: 134.2,
      loadTime: 0.9,
      status: 'optimized',
      components: ['Shadcn/UI', 'Lucide Icons', 'Custom Components']
    }
  ];

  const totalSize = bundleData.reduce((sum, bundle) => sum + bundle.size, 0);
  const totalOptimizedSize = bundleData.reduce((sum, bundle) => sum + bundle.optimizedSize, 0);
  const sizeSaved = totalSize - totalOptimizedSize;
  const percentSaved = Math.round((sizeSaved / totalSize) * 100);

  const getStatusIcon = (status: BundleInfo['status']) => {
    switch (status) {
      case 'optimized':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'needs-optimization':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: BundleInfo['status']) => {
    const variants = {
      optimized: 'default',
      'needs-optimization': 'secondary',
      critical: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Code Splitting Optimizer</h2>
          <p className="text-muted-foreground">
            Monitor and optimize bundle sizes for better performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Analyze Bundle
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Optimize Now
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bundle Size</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} KB</div>
            <p className="text-xs text-muted-foreground">
              {totalOptimizedSize.toFixed(1)} KB optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Size Reduction</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{percentSaved}%</div>
            <p className="text-xs text-muted-foreground">
              {sizeSaved.toFixed(1)} KB saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chunks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundleData.length}</div>
            <p className="text-xs text-muted-foreground">
              {bundleData.filter(b => b.status === 'optimized').length} optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...bundleData.map(b => b.loadTime)).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">
              Largest chunk
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bundles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
          <TabsTrigger value="lazy-loading">Lazy Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Details</CardTitle>
              <CardDescription>
                Detailed breakdown of all application bundles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundleData.map((bundle) => (
                  <div key={bundle.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bundle.status)}
                        <h3 className="font-semibold">{bundle.name}</h3>
                        {getStatusBadge(bundle.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bundle.loadTime}s load time
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Original Size</div>
                        <div className="font-medium">{bundle.size.toFixed(1)} KB</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Optimized Size</div>
                        <div className="font-medium text-success">
                          {bundle.optimizedSize.toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Optimization Progress</span>
                        <span>
                          {Math.round(((bundle.size - bundle.optimizedSize) / bundle.size) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={((bundle.size - bundle.optimizedSize) / bundle.size) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Components</div>
                      <div className="flex flex-wrap gap-1">
                        {bundle.components.map((component) => (
                          <Badge key={component} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Actionable steps to improve bundle performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-success bg-success/10 p-4 rounded">
                  <h4 className="font-semibold text-success mb-2">Tree Shaking Enabled</h4>
                  <p className="text-sm">
                    Unused code is automatically removed during build process.
                  </p>
                </div>

                <div className="border-l-4 border-warning bg-warning/10 p-4 rounded">
                  <h4 className="font-semibold text-warning mb-2">Vendor Bundle Optimization</h4>
                  <p className="text-sm mb-2">
                    Your vendor bundle is larger than recommended (512.7 KB).
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Consider splitting vendor dependencies</li>
                    <li>• Remove unused Lodash functions</li>
                    <li>• Use dynamic imports for large libraries</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary bg-primary/10 p-4 rounded">
                  <h4 className="font-semibold text-primary mb-2">Dynamic Imports</h4>
                  <p className="text-sm mb-2">
                    Implement dynamic imports for route-based code splitting:
                  </p>
                  <code className="block text-xs bg-muted p-2 rounded mt-2">
                    {`const Dashboard = lazy(() => import('./Dashboard'));`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lazy-loading">
          <Card>
            <CardHeader>
              <CardTitle>Lazy Loading Demo</CardTitle>
              <CardDescription>
                Example of lazy-loaded components with Suspense boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dashboard Component</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                        <div className="h-32 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            Lazy Dashboard Loaded
                          </span>
                        </div>
                      </Suspense>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Component</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                        <div className="h-32 bg-success/10 rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            Lazy Profile Loaded
                          </span>
                        </div>
                      </Suspense>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transactions Component</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                        <div className="h-32 bg-warning/10 rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            Lazy Transactions Loaded
                          </span>
                        </div>
                      </Suspense>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted p-4 rounded">
                  <h4 className="font-semibold mb-2">Implementation Benefits:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Reduced initial bundle size</li>
                    <li>• Faster time to interactive</li>
                    <li>• Better perceived performance</li>
                    <li>• Automatic code splitting by routes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}