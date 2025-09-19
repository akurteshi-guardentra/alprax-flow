import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, User, Eye, Wallet, Send, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TestUser {
  id: string;
  email: string;
  displayName: string;
  country: string;
  role: 'sender' | 'receiver';
  balance: number;
  testPassword: string;
  description: string;
}

const TEST_USERS: TestUser[] = [
  {
    id: 'alice',
    email: 'alice@test.com',
    displayName: 'Alice Johnson',
    country: 'Austria',
    role: 'sender',
    balance: 1000.00,
    testPassword: 'test123',
    description: 'Sending money from Austria to family abroad'
  },
  {
    id: 'bob',
    email: 'bob@test.com',
    displayName: 'Bob Smith',
    country: 'Kosovo',
    role: 'receiver',
    balance: 250.50,
    testPassword: 'test123',
    description: 'Receiving money in Kosovo'
  },
  {
    id: 'carol',
    email: 'carol@test.com',
    displayName: 'Carol Martinez',
    country: 'Albania',
    role: 'receiver',
    balance: 500.75,
    testPassword: 'test123',
    description: 'Receiving money in Albania'
  },
  {
    id: 'david',
    email: 'david@test.com',
    displayName: 'David Weber',
    country: 'Switzerland',
    role: 'sender',
    balance: 2500.00,
    testPassword: 'test123',
    description: 'Sending money from Switzerland'
  }
];

export function UserSwitcher() {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    from: string;
    to: string;
    amount: number;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const testUser = TEST_USERS.find(u => u.email === user.email);
        if (testUser) {
          setCurrentUser(testUser.id);
          setSelectedUser(testUser.id);
        }
      }
    };
    getCurrentUser();
  }, []);

  const handleUserSwitch = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const user = TEST_USERS.find(u => u.id === userId);
      if (!user) return;

      // Sign out current user
      await supabase.auth.signOut();
      
      // Sign in as selected user
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.testPassword
      });

      if (error) {
        toast.error(`Failed to switch to ${user.displayName}: ${error.message}`);
        return;
      }

      setCurrentUser(userId);
      toast.success(`Switched to ${user.displayName}`);
      
      // Refresh the page to update the UI
      window.location.reload();
      
    } catch (error) {
      console.error('User switch error:', error);
      toast.error('Failed to switch user');
    } finally {
      setIsLoading(false);
    }
  };

  const addMockTransaction = (fromId: string, toId: string, amount: number) => {
    setRecentTransactions(prev => [
      {
        from: fromId,
        to: toId,
        amount,
        timestamp: new Date()
      },
      ...prev.slice(0, 4) // Keep only last 5 transactions
    ]);
  };

  const getCurrentUserData = () => TEST_USERS.find(u => u.id === currentUser);
  const currentUserData = getCurrentUserData();

  return (
    <div className="space-y-6">
      {/* Current User Status */}
      {currentUserData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-mobile border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-green-400" />
                Currently logged in as
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{currentUserData.displayName}</div>
                    <div className="text-white/60 text-sm">{currentUserData.email}</div>
                  </div>
                  <Badge variant={currentUserData.role === 'sender' ? 'default' : 'secondary'}>
                    {currentUserData.role === 'sender' ? (
                      <>
                        <Send className="w-3 h-3 mr-1" />
                        Sender
                      </>
                    ) : (
                      <>
                        <Wallet className="w-3 h-3 mr-1" />
                        Receiver
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Country:</span>
                  <span className="text-white">{currentUserData.country}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Balance:</span>
                  <span className="text-white font-medium">€{currentUserData.balance.toFixed(2)}</span>
                </div>
                <p className="text-xs text-white/60">{currentUserData.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Switcher */}
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Multi-User Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Switch to test user:</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select a test user..." />
              </SelectTrigger>
              <SelectContent>
                {TEST_USERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.country} • {user.role} • €{user.balance}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => handleUserSwitch(selectedUser)}
            disabled={isLoading || !selectedUser || selectedUser === currentUser}
            className="btn-mobile-primary w-full"
          >
            {isLoading ? (
              <>
                <Eye className="w-4 h-4 mr-2 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Login as {TEST_USERS.find(u => u.id === selectedUser)?.displayName || 'User'}
              </>
            )}
          </Button>

          <div className="text-xs text-white/50 bg-white/5 p-3 rounded-lg">
            <strong>Testing Tip:</strong> Switch between users to test the complete money transfer flow. 
            Alice and David can send money, while Bob and Carol can receive it.
          </div>
        </CardContent>
      </Card>

      {/* Available Test Scenarios */}
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowUpRight className="w-5 h-5" />
            Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white text-sm">Austria → Kosovo</div>
              <div className="text-xs text-white/60">Alice sends money to Bob</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white text-sm">Switzerland → Albania</div>
              <div className="text-xs text-white/60">David sends money to Carol</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white text-sm">Cross-border testing</div>
              <div className="text-xs text-white/60">Test different currency corridors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mock Transactions */}
      {recentTransactions.length > 0 && (
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="text-white">Recent Test Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">
                    {TEST_USERS.find(u => u.id === tx.from)?.displayName} → {TEST_USERS.find(u => u.id === tx.to)?.displayName}
                  </span>
                  <span className="text-white font-medium">€{tx.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}