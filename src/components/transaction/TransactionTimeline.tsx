import { Check, Clock, AlertCircle, ArrowDownLeft, ArrowUpRight, RefreshCw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { TransactionTimelineEvent, TransactionStatus } from "@/services/stellar/types";
import { cn } from "@/lib/utils";

interface TransactionTimelineProps {
  events: TransactionTimelineEvent[];
  transactionType?: 'sent' | 'received' | 'funding';
  className?: string;
}

export function TransactionTimeline({ events, transactionType = 'sent', className = "" }: TransactionTimelineProps) {  // Get the latest status
  const currentStatus = events.length > 0 
    ? events[events.length - 1].status 
    : 'initiated' as TransactionStatus;
  
  // Define the steps in our transaction flow with more detailed descriptions
  const steps = [
    { 
      id: 'initiated', 
      label: 'Initiated', 
      icon: Clock,
      description: 'Transaction created and ready to submit'
    },
    { 
      id: 'submitted', 
      label: 'Submitted', 
      icon: RefreshCw,
      description: 'Transaction submitted to the payment network'
    },
    { 
      id: 'pending', 
      label: 'Processing', 
      icon: Clock,
      description: 'Transaction is being processed by validators'
    },
    { 
      id: 'completed', 
      label: 'Confirmed', 
      icon: Check,
      description: 'Transaction confirmed and recorded securely'
    },
    { 
      id: 'received', 
      label: 'Received', 
      icon: ArrowDownLeft,
      description: 'Funds are available in recipient account'
    }
  ];
    // Create custom timeline steps based on transaction type
  const filteredSteps = steps.filter(step => {
    // For sent transactions, include all steps except 'received'
    if (transactionType === 'sent') {
      return step.id !== 'received';
    }
    // For received transactions, skip initiation and submission
    if (transactionType === 'received') {
      return !['initiated', 'submitted'].includes(step.id);
    }
    // For funding transactions, skip the "received" step
    if (transactionType === 'funding') {
      return step.id !== 'received';
    }
    return true;
  });
  
  // Find the current step index in our filtered steps
  const currentStepIndex = filteredSteps.findIndex(step => step.id === currentStatus);
  
  // Format timestamp to readable time
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  // Find the timestamp for a specific status
  const getStatusTimestamp = (status: string): string | null => {
    const event = events.find(t => t.status === status as TransactionStatus);
    return event ? formatTime(event.timestamp) : null;
  };
  
  return (
    <div className={`space-y-3 px-2 py-3 ${className}`}>
      <h3 className="text-sm font-semibold text-white/70">
        Transaction Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10"></div>
        
        {/* Timeline steps */}
        <div className="space-y-4">
          {filteredSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const timestamp = getStatusTimestamp(step.id);
            const isCurrentStep = index === currentStepIndex;
            
            // Define color classes based on step status
            const iconContainerClasses = cn(
              "relative z-10 flex items-center justify-center w-6 h-6 rounded-full",
              isCurrentStep 
                ? "bg-blue-500 text-white" 
                : isCompleted 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-white/10 text-white/40"
            );
            
            const textClasses = cn(
              "text-sm",
              isCompleted ? "text-white" : "text-white/40"
            );
            
            const descriptionClasses = cn(
              "text-xs mt-0.5",
              isCompleted ? "text-white/60" : "text-white/30"
            );
            
            // Add animation if this is the current step
            const iconAnimation = isCurrentStep
              ? { scale: [0.95, 1.05, 0.95], transition: { repeat: Infinity, duration: 2 } }
              : {};
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start"
              >
                <motion.div 
                  className={iconContainerClasses}
                  animate={iconAnimation}
                >
                  <StepIcon size={14} className={isCurrentStep ? "animate-pulse" : ""} />
                </motion.div>
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between">
                    <span className={textClasses}>
                      {step.label}
                    </span>
                    {timestamp && (
                      <span className="text-xs text-white/40">{timestamp}</span>
                    )}
                  </div>
                  <p className={descriptionClasses}>{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
