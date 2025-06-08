
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Trophy, Crown } from "lucide-react";
import { motion } from "framer-motion";

export function RewardsTracker() {
  const tiers = [
    { name: "Bronze", icon: Star, current: true, progress: 75, points: 750, target: 1000 },
    { name: "Silver", icon: Gift, current: false, progress: 30, points: 1500, target: 5000 },
    { name: "Gold", icon: Trophy, current: false, progress: 0, points: 5000, target: 10000 },
    { name: "Platinum", icon: Crown, current: false, progress: 0, points: 10000, target: 25000 }
  ];

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-kosovo-yellow" />
          Rewards Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    tier.current ? 'bg-kosovo-yellow/20' : 'bg-white/10'
                  }`}>
                    <tier.icon className={`h-4 w-4 ${
                      tier.current ? 'text-kosovo-yellow' : 'text-white/60'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${
                      tier.current ? 'text-white' : 'text-white/60'
                    }`}>
                      {tier.name}
                    </p>
                    <p className="text-sm text-white/40">
                      {tier.points.toLocaleString()} / {tier.target.toLocaleString()} points
                    </p>
                  </div>
                </div>
                <span className={`text-sm ${
                  tier.current ? 'text-kosovo-yellow' : 'text-white/40'
                }`}>
                  {tier.progress}%
                </span>
              </div>
              <Progress
                value={tier.progress}
                className={`h-2 ${tier.current ? "bg-kosovo-yellow/20" : "bg-white/10"} [&>div]:bg-kosovo-yellow [&>div]:transition-all ${!tier.current && "[&>div]:bg-white/20"}`}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
