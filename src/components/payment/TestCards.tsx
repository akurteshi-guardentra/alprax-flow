
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface TestCard {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  description: string;
}

const testCards: TestCard[] = [
  {
    name: "Visa Success",
    number: "4242 4242 4242 4242",
    expiry: "12/25",
    cvc: "123",
    description: "Payment succeeds"
  },
  {
    name: "Visa Declined",
    number: "4000 0000 0000 0002",
    expiry: "12/25", 
    cvc: "123",
    description: "Payment is declined"
  },
  {
    name: "Mastercard",
    number: "5555 5555 5555 4444",
    expiry: "12/25",
    cvc: "123",
    description: "Payment succeeds"
  }
];

export function TestCards() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-400" />
          Test Cards (Stripe Test Mode)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCards.map((card, index) => (
          <div key={index} className="bg-slate-900/50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-white font-medium text-sm">{card.name}</p>
                <p className="text-white/60 text-xs">{card.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(card.number)}
                className="h-6 px-2 text-white/70 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-white/50">Number:</span>
                <p className="text-white font-mono">{card.number}</p>
              </div>
              <div>
                <span className="text-white/50">Expiry:</span>
                <p className="text-white font-mono">{card.expiry}</p>
              </div>
              <div>
                <span className="text-white/50">CVC:</span>
                <p className="text-white font-mono">{card.cvc}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="text-xs text-white/40 text-center pt-2 border-t border-white/10">
          Use any future expiry date and any 3-digit CVC
        </div>
      </CardContent>
    </Card>
  );
}
