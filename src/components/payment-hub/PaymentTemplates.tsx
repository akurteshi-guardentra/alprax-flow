import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2, Calendar, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PaymentTemplate {
  id: string;
  name: string;
  recipientName: string;
  amount: string;
  currency: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly';
  nextDate?: string;
  isActive: boolean;
}

interface PaymentTemplatesProps {
  onUseTemplate: (template: PaymentTemplate) => void;
  className?: string;
}

const mockTemplates: PaymentTemplate[] = [
  {
    id: '1',
    name: 'Monthly Rent',
    recipientName: 'Landlord',
    amount: '1200',
    currency: 'EUR',
    frequency: 'monthly',
    nextDate: '2024-08-01',
    isActive: true
  },
  {
    id: '2',
    name: 'Weekly Allowance',
    recipientName: 'Mom',
    amount: '50',
    currency: 'EUR',
    frequency: 'weekly',
    nextDate: '2024-07-15',
    isActive: true
  },
  {
    id: '3',
    name: 'Quarterly Savings',
    recipientName: 'Savings Account',
    amount: '500',
    currency: 'EUR',
    frequency: 'quarterly',
    isActive: false
  }
];

export const PaymentTemplates = memo(function PaymentTemplates({
  onUseTemplate,
  className
}: PaymentTemplatesProps) {
  const [templates, setTemplates] = useState<PaymentTemplate[]>(mockTemplates);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PaymentTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    recipientName: '',
    amount: '',
    currency: 'EUR',
    frequency: 'monthly' as const
  });

  const handleCreateTemplate = () => {
    const template: PaymentTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      isActive: true,
      nextDate: getNextDate(newTemplate.frequency)
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      recipientName: '',
      amount: '',
      currency: 'EUR',
      frequency: 'monthly'
    });
    setShowCreateDialog(false);
  };

  const getNextDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      default:
        return '';
    }
    return now.toISOString().split('T')[0];
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return <RefreshCw className="w-3 h-3" />;
      case 'monthly': return <Calendar className="w-3 h-3" />;
      case 'quarterly': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'text-green-400';
      case 'monthly': return 'text-blue-400';
      case 'quarterly': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Payment Templates</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Create Payment Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Rent"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="recipient-name">Recipient</Label>
                <Input
                  id="recipient-name"
                  value={newTemplate.recipientName}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Recipient name"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTemplate.amount}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <Label>Frequency</Label>
                  <Select value={newTemplate.frequency} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleCreateTemplate} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200",
              template.isActive 
                ? "bg-white/5 border-white/20 hover:bg-white/10" 
                : "bg-gray-800/50 border-gray-700 opacity-60"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white">{template.name}</h4>
                  <div className={cn("flex items-center gap-1 text-xs", getFrequencyColor(template.frequency))}>
                    {getFrequencyIcon(template.frequency)}
                    <span className="capitalize">{template.frequency}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-white/70">
                  <p>To: {template.recipientName}</p>
                  <p>Amount: {template.amount} {template.currency}</p>
                  {template.nextDate && (
                    <p>Next: {new Date(template.nextDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUseTemplate(template)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Use
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 p-2"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 p-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {templates.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No payment templates yet</p>
            <p className="text-sm">Create templates for recurring payments</p>
          </div>
        )}
      </div>
    </div>
  );
});