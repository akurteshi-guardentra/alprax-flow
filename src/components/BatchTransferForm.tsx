
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBatchTransfers } from '@/hooks/useBatchTransfers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFavoriteRecipients } from '@/hooks/useFavoriteRecipients';

interface TransferInput {
  recipient_id: string;
  amount: string;
}

export function BatchTransferForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [transfers, setTransfers] = useState<TransferInput[]>([{ recipient_id: '', amount: '' }]);
  
  const { createBatchTransfer, isCreating } = useBatchTransfers();
  const { recipients } = useFavoriteRecipients();

  const addTransfer = () => {
    setTransfers([...transfers, { recipient_id: '', amount: '' }]);
  };

  const removeTransfer = (index: number) => {
    setTransfers(transfers.filter((_, i) => i !== index));
  };

  const updateTransfer = (index: number, field: keyof TransferInput, value: string) => {
    const newTransfers = [...transfers];
    newTransfers[index] = { ...newTransfers[index], [field]: value };
    setTransfers(newTransfers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    if (!transfers.length) {
      toast.error('Please add at least one transfer');
      return;
    }

    const invalidTransfers = transfers.some(
      t => !t.recipient_id || !t.amount || isNaN(Number(t.amount)) || Number(t.amount) <= 0
    );

    if (invalidTransfers) {
      toast.error('Please check all transfer amounts and recipients');
      return;
    }

    // Create batch transfer
    createBatchTransfer({
      name,
      description,
      transfers: transfers.map(t => ({
        recipient_id: t.recipient_id,
        amount: Number(t.amount),
      })),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Batch Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Batch Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter batch name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="mt-1"
              />
            </div>

            <div className="space-y-4">
              {transfers.map((transfer, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Label>Recipient</Label>
                    <Select
                      value={transfer.recipient_id}
                      onValueChange={(value) => updateTransfer(index, 'recipient_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients?.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.recipient_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={transfer.amount}
                      onChange={(e) => updateTransfer(index, 'amount', e.target.value)}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                    />
                  </div>

                  {transfers.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="mt-6"
                      onClick={() => removeTransfer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addTransfer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Transfer
            </Button>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Batch Transfer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
