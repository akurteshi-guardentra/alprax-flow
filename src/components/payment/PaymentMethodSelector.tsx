import { useState } from "react";
import { CreditCard, Landmark, Smartphone, Wallet, CheckCircle2, Info, Clock, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCardPayment } from "./StripeCardPayment";
import { TestCards } from "./TestCards";
import { createPaymentIntent, PaymentIntentRequest } from "@/services/PaymentService";

interface PaymentMethodProps {
  onSelect: (methodId: string) => void;
  selected: string;
  amount?: number;
  onPaymentComplete?: () => void;
}

export function PaymentMethodSelector({ 
  onSelect, 
  selected, 
  amount = 1000, // Default to $10.00 (in cents)
  onPaymentComplete 
}: PaymentMethodProps) {
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{
    clientSecret: string;
    id: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleProceedToPayment = async () => {
    if (selected === 'card') {
      setIsCreatingIntent(true);
      setPaymentError(null);
      
      try {
        // Create a payment intent
        const paymentIntentRequest: PaymentIntentRequest = {
          amount,
          currency: 'usd',
          payment_method_type: 'card',
          description: 'Test payment'
        };
        
        const intent = await createPaymentIntent(paymentIntentRequest);
        setPaymentIntent(intent);
        setShowStripeForm(true);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setPaymentError('Failed to initialize payment. Please try again.');
      } finally {
        setIsCreatingIntent(false);
      }
    }
  };
  
  const handlePaymentSuccess = () => {
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };
  
  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };
  
  const handleCloseStripeForm = () => {
    setShowStripeForm(false);
    setPaymentIntent(null);
    setPaymentError(null);
  };
  
  const paymentMethods = [
    { 
      id: "card", 
      name: "Credit Card", 
      icon: CreditCard,
      description: "Fast processing with most major cards accepted",
      processingTime: "Instant",
      fees: "2.9% + $0.30",
      color: "from-blue-600/20 to-blue-400/10"
    },
    { 
      id: "bank", 
      name: "Bank Transfer", 
      icon: Landmark,
      description: "Low fees but may take 1-3 business days",
      processingTime: "1-3 days",
      fees: "$0.25 flat fee",
      color: "from-green-600/20 to-green-400/10"
    },
    { 
      id: "mobile", 
      name: "Mobile Money", 
      icon: Smartphone,
      description: "Quick transfers using your mobile wallet", 
      processingTime: "30 minutes",
      fees: "1.5%",
      color: "from-purple-600/20 to-purple-400/10"
    },
    { 
      id: "wallet", 
      name: "Digital Wallet", 
      icon: Wallet,
      description: "Instant transfers from your cryptocurrency wallet",
      processingTime: "Instant",
      fees: "Network fee only",
      color: "from-yellow-600/20 to-yellow-400/10"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-white font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-white/70" />
          Payment Method
        </label>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">Required</span>
      </div>
      
      {paymentError && (
        <Alert className="bg-red-500/10 border-red-500/20 text-red-200 mb-4">
          <Info className="h-4 w-4 text-red-300" />
          <AlertDescription className="text-xs">
            {paymentError}
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200 mb-4">
        <Info className="h-4 w-4 text-blue-300" />
        <AlertDescription className="text-xs">
          This is a demo environment using Stripe test mode. No actual charges will be made.
        </AlertDescription>
      </Alert>
      
      {showStripeForm && paymentIntent ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
              Card Payment
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCloseStripeForm}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Elements stripe={stripePromise}>
            <StripeCardPayment
              clientSecret={paymentIntent.clientSecret}
              amount={paymentIntent.amount}
              currency={paymentIntent.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
          
          <div className="mt-6">
            <TestCards />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const isSelected = selected === method.id;
              
              return (
                <motion.div
                  key={method.id}
                  onClick={() => onSelect(method.id)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "flex flex-col p-3 rounded-xl cursor-pointer border transition-all duration-300 bg-gradient-to-br backdrop-blur-sm",
                    isSelected
                      ? `${method.color} border-blue-500/30 shadow-lg shadow-blue-500/10`
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "p-1.5 rounded-full",
                      isSelected ? "bg-blue-500/20" : "bg-white/10"
                    )}>
                      <method.icon className={cn(
                        "h-4 w-4",
                        isSelected ? "text-blue-400" : "text-white/70"
                      )} />
                    </div>
                    <span className={cn(
                      "text-sm transition-all duration-300",
                      isSelected ? "text-white font-medium" : "text-white/80"
                    )}>
                      {method.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-blue-400 ml-auto" />
                    )}
                  </div>

                  <div className="ml-8 space-y-2">
                    <p className="text-xs text-white/70">{method.description}</p>
                    
                    <div className="flex items-center text-xs space-x-2">
                      <span className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-full",
                        isSelected ? "bg-black/30" : "bg-black/20"
                      )}>
                        <Clock className="h-3 w-3 text-white/70" />
                        <span className="text-white/80">{method.processingTime}</span>
                      </span>
                      <span className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-full",
                        isSelected ? "bg-black/30" : "bg-black/20"
                      )}>
                        <span className="text-white/80">{method.fees}</span>
                      </span>
                    </div>

                    {isSelected && (
                      <div className="flex items-center text-xs text-blue-400 font-medium mt-1">
                        <span>Selected</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {selected && (
            <div className="mt-4">
              <Button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isCreatingIntent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingIntent ? (
                  <>Processing...</>
                ) : (
                  <>Proceed to Payment</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
