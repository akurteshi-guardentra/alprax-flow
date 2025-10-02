import { Button } from '@/components/ui/button';
import { Plus, Send, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Button
        onClick={() => navigate('/send-money')}
        className="h-20 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 text-white flex-col gap-2"
      >
        <Send className="w-6 h-6" />
        <span className="text-sm font-medium">Send</span>
      </Button>

      <Button
        onClick={() => navigate('/receive-money')}
        className="h-20 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 text-white flex-col gap-2"
      >
        <ArrowDownLeft className="w-6 h-6" />
        <span className="text-sm font-medium">Receive</span>
      </Button>

      <Button
        onClick={() => navigate('/add-funds')}
        className="h-20 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 text-white flex-col gap-2"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-medium">Add Funds</span>
      </Button>
    </div>
  );
}
