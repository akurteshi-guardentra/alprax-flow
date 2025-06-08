
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestAccountSwitcher } from './TestAccountSwitcher';
import { TransactionSimulator } from '../transaction/TransactionSimulator';
import { TransactionHistory } from '../TransactionHistory';
import { Activity, UserRound } from 'lucide-react';
import { useTestAccountContext } from '@/contexts/TestAccountContext';

export function AccountActivity() {
  const { activeAccount } = useTestAccountContext();

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl font-semibold text-white">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Account Activity
            </CardTitle>
            
            {activeAccount && (
              <div className="flex items-center">
                <UserRound className="h-4 w-4 mr-1 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">{activeAccount.name}</span>
                <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-300 border-blue-800">
                  Active
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="bg-slate-800/60 border border-white/10">
              <TabsTrigger value="activity" className="data-[state=active]:bg-white/10 text-white">
                Transaction History
              </TabsTrigger>
              <TabsTrigger value="accounts" className="data-[state=active]:bg-white/10 text-white">
                Test Accounts
              </TabsTrigger>
              <TabsTrigger value="simulator" className="data-[state=active]:bg-white/10 text-white">
                Simulator
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="border-none pt-2 pb-0">
              <TransactionHistory />
            </TabsContent>
            
            <TabsContent value="accounts" className="border-none pt-2 pb-0">
              <TestAccountSwitcher />
            </TabsContent>
            
            <TabsContent value="simulator" className="border-none pt-2 pb-0">
              <TransactionSimulator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
