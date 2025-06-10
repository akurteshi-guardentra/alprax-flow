
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TransactionTimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionTimelineProps {
  events: TransactionTimelineEvent[];
  transactionType?: 'sent' | 'received';
  className?: string;
}

export const TransactionTimeline = ({ 
  events, 
  transactionType = 'sent', 
  className 
}: TransactionTimelineProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex items-start gap-3">
          <div className={cn(
            "rounded-full p-2 border-2",
            event.status === 'completed' ? "bg-green-500/20 border-green-500" :
            event.status === 'pending' ? "bg-yellow-500/20 border-yellow-500" :
            "bg-red-500/20 border-red-500"
          )}>
            {event.status === 'completed' ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-white">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-white/70 mt-1">{event.description}</p>
            )}
            <p className="text-xs text-white/50 mt-1">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionTimeline;
