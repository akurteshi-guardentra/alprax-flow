
import { Brain, TrendingUp, Wallet, Flag, Handshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const predictions = [
  {
    title: "Cross-Border Transfer Alert",
    message: "New secure transfer route available to Albania with reduced fees",
    icon: Flag,
    type: "info",
  },
  {
    title: "Besa Secure Transaction",
    message: "Your last transfer was protected by Besa security protocol",
    icon: Handshake,
    type: "success",
  },
];

export function AIInsights() {
  const { toast } = useToast();

  const handlePredictionClick = (prediction: typeof predictions[0]) => {
    toast({
      title: prediction.title,
      description: prediction.message,
      variant: prediction.type === "warning" ? "destructive" : "default",
    });
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-kosovo-blue/80 to-kosovo-blue/70 backdrop-blur-sm hover:from-kosovo-blue/85 hover:to-kosovo-blue/75 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center justify-center gap-2">
          <Brain className="h-5 w-5 text-kosovo-yellow" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {predictions.map((prediction, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                `border-none cursor-pointer transition-all duration-300 hover:translate-x-1 ${
                prediction.type === "warning"
                  ? "bg-accent/10 hover:bg-accent/20"
                  : "bg-kosovo-yellow/10 hover:bg-kosovo-yellow/20"
              }`)}
              onClick={() => handlePredictionClick(prediction)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`p-3 rounded-full ${
                    prediction.type === "warning"
                      ? "bg-accent/20 text-accent"
                      : "bg-kosovo-yellow/20 text-kosovo-yellow"
                  }`}
                >
                  <prediction.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 text-left flex-1">
                  <p className="font-medium text-white text-base">{prediction.title}</p>
                  <p className="text-sm text-white/90 leading-relaxed">{prediction.message}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
