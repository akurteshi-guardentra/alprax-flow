
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRateAlerts } from '@/hooks/useRateAlerts';

export function RateAlerts() {
  const { rateAlerts, isLoading, createAlert, deleteAlert, toggleAlert } = useRateAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    from_currency: '',
    to_currency: '',
    target_rate: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlert.mutate(newAlert);
    setIsOpen(false);
    setNewAlert({ from_currency: '', to_currency: '', target_rate: 0 });
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Bell className="h-6 w-6 text-indigo-400" />
          Rate Alerts
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-500 hover:bg-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>Create Rate Alert</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>From Currency</Label>
                <Input
                  value={newAlert.from_currency}
                  onChange={(e) => setNewAlert({ ...newAlert, from_currency: e.target.value })}
                  placeholder="EUR"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>To Currency</Label>
                <Input
                  value={newAlert.to_currency}
                  onChange={(e) => setNewAlert({ ...newAlert, to_currency: e.target.value })}
                  placeholder="USD"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={newAlert.target_rate}
                  onChange={(e) => setNewAlert({ ...newAlert, target_rate: parseFloat(e.target.value) })}
                  placeholder="1.05"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <Button type="submit" className="w-full">Create Alert</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-slate-400">Loading alerts...</div>
          ) : rateAlerts?.length === 0 ? (
            <div className="text-center text-slate-400">No rate alerts set</div>
          ) : (
            rateAlerts?.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">
                      {alert.from_currency} → {alert.to_currency}
                    </p>
                    <p className="text-slate-300 text-sm">
                      Target Rate: {alert.target_rate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) =>
                        toggleAlert.mutate({ alertId: alert.id, isActive: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert.mutate(alert.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
