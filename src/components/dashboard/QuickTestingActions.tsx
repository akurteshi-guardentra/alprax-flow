import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Send, TestTube, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function QuickTestingActions() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TestTube className="w-5 h-5" />
            Testing Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => navigate('/multi-user-testing')}
              className="btn-mobile-secondary justify-start"
            >
              <Users className="w-4 h-4 mr-2" />
              Multi-User Testing
              <ArrowUpRight className="w-3 h-3 ml-auto" />
            </Button>
            <Button
              onClick={() => navigate('/payments')}
              className="btn-mobile-primary justify-start"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Money (Fiat UI)
              <ArrowUpRight className="w-3 h-3 ml-auto" />
            </Button>
          </div>
          <div className="mt-3 text-xs text-white/50 bg-white/5 p-3 rounded-lg">
            <strong>New:</strong> The app now hides blockchain complexity. Users only see EUR amounts, 
            just like Revolut or Wise!
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}