import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CurrencyAlertCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    fromCurrency: 'EUR',
    toCurrency: 'ALL',
    targetRate: '',
    alertType: 'above'
  });

  // Mock data for demonstration
  const mockAlerts = [
    {
      id: '1',
      from_currency: 'EUR',
      to_currency: 'ALL',
      target_rate: 107.5,
      current_rate: 106.8,
      alert_type: 'above',
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      from_currency: 'EUR',
      to_currency: 'RSD',
      target_rate: 117.0,
      current_rate: 117.2,
      alert_type: 'below',
      is_active: true,
      created_at: '2024-01-10'
    }
  ];

  const currencies = [
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'ALL', name: 'Albanian Lek', flag: '🇦🇱' },
    { code: 'RSD', name: 'Serbian Dinar', flag: '🇷🇸' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' }
  ];

  const handleCreateAlert = () => {
    // Implementation would create the alert
    console.log('Creating alert:', alertData);
    setIsDialogOpen(false);
    setAlertData({
      fromCurrency: 'EUR',
      toCurrency: 'ALL',
      targetRate: '',
      alertType: 'above'
    });
  };

  const getAlertStatus = (alert: any) => {
    const { target_rate, current_rate, alert_type } = alert;
    
    if (alert_type === 'above' && current_rate >= target_rate) {
      return { status: 'triggered', color: 'bg-green-100 text-green-800' };
    } else if (alert_type === 'below' && current_rate <= target_rate) {
      return { status: 'triggered', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'waiting', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-kosovo-yellow" />
            Currency Alerts
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-kosovo-yellow hover:bg-kosovo-yellow/90 text-black">
                <Plus className="h-4 w-4 mr-1" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Create Currency Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Currency</Label>
                    <Select value={alertData.fromCurrency} onValueChange={(value) => 
                      setAlertData({ ...alertData, fromCurrency: value })
                    }>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.flag} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To Currency</Label>
                    <Select value={alertData.toCurrency} onValueChange={(value) => 
                      setAlertData({ ...alertData, toCurrency: value })
                    }>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.flag} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Target Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter target rate"
                    value={alertData.targetRate}
                    onChange={(e) => setAlertData({ ...alertData, targetRate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <Label>Alert When Rate</Label>
                  <Select value={alertData.alertType} onValueChange={(value) => 
                    setAlertData({ ...alertData, alertType: value })
                  }>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Goes above target</SelectItem>
                      <SelectItem value="below">Goes below target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleCreateAlert} className="w-full">
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mockAlerts.length === 0 ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-kosovo-yellow mx-auto mb-4" />
            <p className="text-white/70 mb-4">
              No currency alerts set up yet. Get notified when exchange rates hit your target!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockAlerts.map((alert) => {
              const alertStatus = getAlertStatus(alert);
              const currency1 = currencies.find(c => c.code === alert.from_currency);
              const currency2 = currencies.find(c => c.code === alert.to_currency);
              
              return (
                <div key={alert.id} className="bg-white/10 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {currency1?.flag} → {currency2?.flag}
                      </span>
                      <span className="text-white font-medium">
                        {alert.from_currency}/{alert.to_currency}
                      </span>
                    </div>
                    <Badge className={alertStatus.color}>
                      {alertStatus.status === 'triggered' ? 'Triggered' : 'Waiting'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-white/70">Target Rate</div>
                      <div className="text-white font-medium flex items-center gap-1">
                        {alert.alert_type === 'above' ? 
                          <TrendingUp className="h-3 w-3" /> : 
                          <TrendingDown className="h-3 w-3" />
                        }
                        {alert.target_rate}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70">Current Rate</div>
                      <div className="text-kosovo-yellow font-medium">
                        {alert.current_rate}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70">Difference</div>
                      <div className={`font-medium ${
                        alertStatus.status === 'triggered' ? 'text-green-400' : 'text-white'
                      }`}>
                        {Math.abs(alert.current_rate - alert.target_rate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="bg-white/10 p-3 rounded-lg">
          <div className="text-white/70 text-sm text-center">
            💡 Tip: Set alerts for optimal transfer timing to save money on exchange rates
          </div>
        </div>
      </CardContent>
    </Card>
  );
}