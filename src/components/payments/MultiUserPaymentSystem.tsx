import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { StellarAddressDisplay } from '@/components/ui/StellarAddressDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCopy } from '@/lib/constants/copy';
import { 
  Users, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  UserCheck,
  UserX,
  Split,
  Calculator,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  address: string;
  amount: string;
  currency: string;
  memo?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
}

interface BatchPayment {
  id: string;
  name: string;
  recipients: Recipient[];
  totalAmount: number;
  currency: string;
  requiredApprovals: number;
  currentApprovals: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'executed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
}

interface Approver {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  hasApproved: boolean;
}

export function MultiUserPaymentSystem() {
  const isMobile = useIsMobile();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [batchPayments, setBatchPayments] = useState<BatchPayment[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([
    { id: '1', name: 'John Admin', email: 'john@company.com', role: 'admin', hasApproved: false },
    { id: '2', name: 'Sarah Manager', email: 'sarah@company.com', role: 'manager', hasApproved: false },
    { id: '3', name: 'Mike Viewer', email: 'mike@company.com', role: 'viewer', hasApproved: false }
  ]);
  const [currentBatch, setCurrentBatch] = useState<BatchPayment | null>(null);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [totalSplitAmount, setTotalSplitAmount] = useState('');
  const [isDualAuth, setIsDualAuth] = useState(true);
  const [showApprovalFlow, setShowApprovalFlow] = useState(false);

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: '',
      address: '',
      amount: '',
      currency: 'XLM',
      status: 'pending',
      verified: false
    };
    setRecipients([...recipients, newRecipient]);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string | boolean) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const calculateSplitAmounts = () => {
    if (!totalSplitAmount || recipients.length === 0) return;
    
    const total = parseFloat(totalSplitAmount);
    
    switch (splitMethod) {
      case 'equal':
        const equalAmount = (total / recipients.length).toFixed(7);
        setRecipients(recipients.map(r => ({ ...r, amount: equalAmount })));
        break;
      case 'percentage':
        // For percentage, assume equal percentages for now
        const percentage = (100 / recipients.length).toFixed(2);
        const percentageAmount = (total * (parseFloat(percentage) / 100)).toFixed(7);
        setRecipients(recipients.map(r => ({ ...r, amount: percentageAmount })));
        break;
    }
  };

  const createBatchPayment = () => {
    if (recipients.length === 0) return;
    
    const totalAmount = recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
    
    const batch: BatchPayment = {
      id: Date.now().toString(),
      name: `Batch Payment ${new Date().toLocaleDateString()}`,
      recipients: [...recipients],
      totalAmount,
      currency: 'XLM',
      requiredApprovals: isDualAuth ? 2 : 1,
      currentApprovals: 0,
      status: 'draft',
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };
    
    setBatchPayments([...batchPayments, batch]);
    setCurrentBatch(batch);
    setShowApprovalFlow(true);
  };

  const submitForApproval = (batchId: string) => {
    setBatchPayments(prev => prev.map(b => 
      b.id === batchId ? { ...b, status: 'pending_approval' as const } : b
    ));
  };

  const handleApproval = (batchId: string, approve: boolean) => {
    setBatchPayments(prev => prev.map(batch => {
      if (batch.id === batchId) {
        const newApprovals = approve ? batch.currentApprovals + 1 : batch.currentApprovals;
        const newStatus = newApprovals >= batch.requiredApprovals ? 'approved' : 'pending_approval';
        return { 
          ...batch, 
          currentApprovals: newApprovals,
          status: newStatus
        };
      }
      return batch;
    }));
    
    // Update approver status
    setApprovers(prev => prev.map(a => 
      a.id === '1' ? { ...a, hasApproved: approve } : a
    ));
  };

  const executeBatch = (batchId: string) => {
    setBatchPayments(prev => prev.map(b => 
      b.id === batchId ? { ...b, status: 'executed' } : b
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'pending_approval':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'executed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'pending_approval':
        return <Eye className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'executed':
        return <Send className="h-4 w-4" />;
      case 'cancelled':
        return <UserX className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Multi-User Payment System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{recipients.length}</div>
              <div className="text-sm text-muted-foreground">Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{batchPayments.length}</div>
              <div className="text-sm text-muted-foreground">Batch Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {batchPayments.filter(b => b.status === 'executed').length}
              </div>
              <div className="text-sm text-muted-foreground">Executed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {batchPayments.filter(b => b.status === 'pending_approval').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="create">Create Batch</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="approvers">Approvers</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          {/* Split Configuration */}
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Split className="h-4 w-4" />
                <span>Split Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Split Method</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={splitMethod === 'equal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSplitMethod('equal')}
                    >
                      Equal
                    </Button>
                    <Button
                      variant={splitMethod === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSplitMethod('custom')}
                    >
                      Custom
                    </Button>
                    <Button
                      variant={splitMethod === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSplitMethod('percentage')}
                    >
                      Percentage
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    placeholder="0.00"
                    value={totalSplitAmount}
                    onChange={(e) => setTotalSplitAmount(e.target.value)}
                    className="mobile-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Calculate</Label>
                  <Button onClick={calculateSplitAmounts} className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Split Amount
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dualAuth"
                  checked={isDualAuth}
                  onCheckedChange={(checked) => setIsDualAuth(!!checked)}
                />
                <Label htmlFor="dualAuth" className="text-sm">
                  Require dual authorization for this batch
                </Label>
                {isDualAuth ? <Lock className="h-4 w-4 text-green-600" /> : <Unlock className="h-4 w-4 text-yellow-600" />}
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card className="mobile-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recipients</CardTitle>
                <Button onClick={addRecipient} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recipients added yet. Click "Add Recipient" to start.
                </div>
              ) : (
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Recipient {index + 1}</span>
                        <Button
                          onClick={() => removeRecipient(recipient.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            placeholder="Recipient name"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                            className="mobile-input"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Amount (XLM)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={recipient.amount}
                            onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                            className="mobile-input"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Stellar Address</Label>
                        <Input
                          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          value={recipient.address}
                          onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                          className="mobile-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Memo (Optional)</Label>
                        <Input
                          placeholder="Payment memo"
                          value={recipient.memo || ''}
                          onChange={(e) => updateRecipient(recipient.id, 'memo', e.target.value)}
                          className="mobile-input"
                        />
                      </div>
                      
                      {recipient.address && (
                        <StellarAddressDisplay 
                          address={recipient.address} 
                          mode="compact"
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>
                        {recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(7)} XLM
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createBatchPayment} 
                    className="w-full mobile-button-primary"
                    disabled={recipients.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Create Batch Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {batchPayments.filter(b => b.status === 'pending_approval').map((batch) => (
            <Card key={batch.id} className="mobile-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                  <Badge className={getStatusColor(batch.status)}>
                    {getStatusIcon(batch.status)}
                    <span className="ml-1">{batch.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-semibold">{batch.totalAmount.toFixed(7)} {batch.currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Recipients</div>
                    <div className="font-semibold">{batch.recipients.length}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Approvals</span>
                    <span>{batch.currentApprovals}/{batch.requiredApprovals}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(batch.currentApprovals / batch.requiredApprovals) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleApproval(batch.id, true)}
                    className="flex-1 mobile-button-primary"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleApproval(batch.id, false)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {batchPayments.filter(b => b.status === 'approved').map((batch) => (
            <Card key={batch.id} className="mobile-card border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                  <Badge className={getStatusColor(batch.status)}>
                    {getStatusIcon(batch.status)}
                    <span className="ml-1">Ready to Execute</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => executeBatch(batch.id)}
                  className="w-full mobile-button-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Execute Batch Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {batchPayments.map((batch) => (
            <Card key={batch.id} className="mobile-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                  <Badge className={getStatusColor(batch.status)}>
                    {getStatusIcon(batch.status)}
                    <span className="ml-1">{batch.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-semibold">{batch.totalAmount.toFixed(7)} {batch.currency}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Recipients</div>
                    <div className="font-semibold">{batch.recipients.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-semibold">{new Date(batch.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created By</div>
                    <div className="font-semibold">{batch.createdBy}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approvers" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Approval Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvers.map((approver) => (
                <div key={approver.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      approver.role === 'admin' ? 'bg-red-100 text-red-600' :
                      approver.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{approver.name}</div>
                      <div className="text-sm text-muted-foreground">{approver.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {approver.role}
                    </Badge>
                    {approver.hasApproved ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}