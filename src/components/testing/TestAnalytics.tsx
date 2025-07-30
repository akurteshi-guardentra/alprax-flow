import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw, Download, Filter } from 'lucide-react';

interface TestTrend {
  date: string;
  overallScore: number;
  performanceScore: number;
  accessibilityScore: number;
  bugCount: number;
  testsPassed: number;
  testsTotal: number;
}

interface TestCategory {
  name: string;
  value: number;
  color: string;
}

export function TestAnalytics() {
  const [trendData, setTrendData] = useState<TestTrend[]>([]);
  const [categoryData, setCategoryData] = useState<TestCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateTrendData = () => {
    const data: TestTrend[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic trending data with some volatility
      const baseScore = 85 + Math.random() * 10;
      const performanceScore = baseScore + (Math.random() - 0.5) * 10;
      const accessibilityScore = baseScore + (Math.random() - 0.5) * 8;
      const bugCount = Math.floor(Math.random() * 15);
      const testsTotal = 25 + Math.floor(Math.random() * 10);
      const testsPassed = testsTotal - Math.floor(Math.random() * 5);
      
      data.push({
        date: date.toISOString().split('T')[0],
        overallScore: Math.round(baseScore),
        performanceScore: Math.round(Math.max(0, Math.min(100, performanceScore))),
        accessibilityScore: Math.round(Math.max(0, Math.min(100, accessibilityScore))),
        bugCount,
        testsPassed,
        testsTotal
      });
    }
    
    return data;
  };

  const generateCategoryData = (): TestCategory[] => [
    { name: 'UI/UX Tests', value: 92, color: '#3b82f6' },
    { name: 'Performance', value: 88, color: '#10b981' },
    { name: 'Accessibility', value: 95, color: '#8b5cf6' },
    { name: 'Security', value: 97, color: '#f59e0b' },
    { name: 'API Tests', value: 91, color: '#ef4444' },
    { name: 'Load Tests', value: 85, color: '#06b6d4' }
  ];

  const refreshData = async () => {
    setIsLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setTrendData(generateTrendData());
    setCategoryData(generateCategoryData());
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const latestData = trendData[trendData.length - 1];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Test Analytics & Insights
              </CardTitle>
              <CardDescription>
                Comprehensive analytics dashboard for test results and trends
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={refreshData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Status Overview */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(latestData.overallScore)}`}>
                    {latestData.overallScore}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                {getScoreBadge(latestData.overallScore)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tests Passed</p>
                  <p className="text-2xl font-bold">
                    {latestData.testsPassed}/{latestData.testsTotal}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary">
                  {Math.round((latestData.testsPassed / latestData.testsTotal) * 100)}% Pass Rate
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <p className={`text-2xl font-bold ${getScoreColor(latestData.performanceScore)}`}>
                    {latestData.performanceScore}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                {getScoreBadge(latestData.performanceScore)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
                  <p className="text-2xl font-bold text-red-600">
                    {latestData.bugCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2">
                <Badge variant={latestData.bugCount === 0 ? "secondary" : "destructive"}>
                  {latestData.bugCount === 0 ? 'Clean' : `${latestData.bugCount} Issues`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Trends (30 Days)</CardTitle>
                <CardDescription>Overall quality metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'overallScore' ? 'Overall' : 
                        name === 'performanceScore' ? 'Performance' : 'Accessibility'
                      ]}
                    />
                    <Line type="monotone" dataKey="overallScore" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="performanceScore" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="accessibilityScore" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Category Scores</CardTitle>
                <CardDescription>Performance breakdown by test category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Timeline</CardTitle>
              <CardDescription>Performance score trends and optimization progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [`${value}%`, 'Performance Score']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performanceScore" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Pass Rate</CardTitle>
              <CardDescription>Success rate of automated tests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      value,
                      name === 'testsPassed' ? 'Passed' : 'Total'
                    ]}
                  />
                  <Bar dataKey="testsTotal" fill="#e5e7eb" />
                  <Bar dataKey="testsPassed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Discovery Timeline</CardTitle>
              <CardDescription>Number of issues detected over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [value, 'Issues Found']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bugCount" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}