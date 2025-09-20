import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fee: string;
  time: string;
  recommended?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stellar',
    title: 'Stellar Wallet',
    description: 'Send using your Stellar balance',
    icon: Wallet,
    fee: 'Free',
    time: 'Instant',
    recommended: true
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    description: 'Pay with your card',
    icon: CreditCard,
    fee: '2.9% + $0.30',
    time: '1-3 minutes'
  },
  {
    id: 'mobile',
    title: 'Mobile Payment',
    description: 'Use mobile wallet',
    icon: Smartphone,
    fee: '1.5%',
    time: '5-10 minutes'
  }
];

interface PaymentMethodSelectorProps {
  selectedMethod?: string;
  onMethodSelect: (methodId: string) => void;
  className?: string;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodSelect,
  className 
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        
        return (
          <Card
            key={method.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 border",
              isSelected 
                ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30" 
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            )}
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-primary/20" : "bg-white/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isSelected ? "text-primary" : "text-white/70"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{method.title}</h4>
                    {method.recommended && (
                      <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/60">{method.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{method.fee}</p>
                <p className="text-xs text-white/50">{method.time}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}