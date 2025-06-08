
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export function PricingCalculator() {
  const [amount, setAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("monthly");
  
  const calculateSavings = () => {
    const baseAmount = parseFloat(amount) || 0;
    const traditionalFee = baseAmount * 0.05; // 5% traditional fee
    const ourFee = baseAmount * 0.01; // 1% our fee
    const savings = traditionalFee - ourFee;
    const annualSavings = frequency === "monthly" ? savings * 12 : savings;
    
    return {
      traditionalFee: traditionalFee.toFixed(2),
      ourFee: ourFee.toFixed(2),
      savings: savings.toFixed(2),
      annualSavings: annualSavings.toFixed(2)
    };
  };

  const results = calculateSavings();

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Calculator className="h-6 w-6 text-kosovo-yellow" />
          Savings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Transfer Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Transfer Frequency</Label>
              <div className="flex gap-2">
                <Button
                  variant={frequency === "monthly" ? "default" : "outline"}
                  onClick={() => setFrequency("monthly")}
                  className={frequency === "monthly" ? "bg-kosovo-yellow text-black" : "text-white"}
                >
                  Monthly
                </Button>
                <Button
                  variant={frequency === "once" ? "default" : "outline"}
                  onClick={() => setFrequency("once")}
                  className={frequency === "once" ? "bg-kosovo-yellow text-black" : "text-white"}
                >
                  One-time
                </Button>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-white/60 text-sm">Traditional Fee</p>
              <p className="text-red-400 text-xl font-bold">${results.traditionalFee}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-white/60 text-sm">Our Fee</p>
              <p className="text-green-400 text-xl font-bold">${results.ourFee}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-white/60 text-sm">Per Transfer Savings</p>
              <p className="text-kosovo-yellow text-xl font-bold">${results.savings}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-white/60 text-sm">
                {frequency === "monthly" ? "Annual" : "Total"} Savings
              </p>
              <p className="text-kosovo-yellow text-xl font-bold">${results.annualSavings}</p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
