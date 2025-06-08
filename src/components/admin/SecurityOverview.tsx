
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, XCircle, AlertCircle, Cpu, Lock, Info } from "lucide-react";
import { useState } from "react";

const recentActivity = [
  { id: 1, user: "john.doe@example.com", action: "Large transfer", amount: "€5,000", status: "flagged", timestamp: "2024-02-20T10:30:00", details: "AI detected unusual amount for this user", aiConfidence: 89 },
  { id: 2, user: "alice.smith@example.com", action: "Multiple login attempts", amount: null, status: "suspicious", timestamp: "2024-02-20T10:15:00", details: "5 failed attempts from different IP addresses", aiConfidence: 94 },
  { id: 3, user: "bob.wilson@example.com", action: "New device login", amount: null, status: "verified", timestamp: "2024-02-20T10:00:00", details: "Successfully passed 2FA verification and device fingerprinting", aiConfidence: 97 },
  { id: 4, user: "emma.brown@example.com", action: "Crypto exchange", amount: "€2,000", status: "completed", timestamp: "2024-02-20T09:45:00", details: "Web3 transaction matched with usual behavior patterns", aiConfidence: 99 },
  { id: 5, user: "michael.jones@example.com", action: "Account accessed from new location", amount: null, status: "blocked", timestamp: "2024-02-20T09:30:00", details: "AI detected login from known malicious IP range", aiConfidence: 96 },
];

export function SecurityOverview() {
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "flagged":
        return "text-amber-400";
      case "suspicious":
        return "text-yellow-400";
      case "verified":
        return "text-green-400";
      case "blocked":
        return "text-red-500";
      default:
        return "text-blue-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "flagged":
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-400" />;
    }
  };

  const toggleDetails = (id: number) => {
    setExpandedDetails(expandedDetails === id ? null : id);
  };

  return (
    <Card className="border-none bg-gradient-to-br from-white/5 to-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          AI Security Monitoring
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Active Protection
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="pb-2 mb-3 border-b border-white/10 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-white/80">AI-powered threat detection active</span>
        </div>
        
        <ScrollArea className="h-[300px] rounded-md">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer ${expandedDetails === activity.id ? 'bg-white/15' : ''}`}
                onClick={() => toggleDetails(activity.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{activity.user}</p>
                    <p className="text-sm text-white/60">{activity.action}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-white/80">{activity.amount}</p>
                    )}
                    <p className="text-xs text-white/50 mt-1">{activity.details}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {getStatusIcon(activity.status)}
                      <p className={`text-sm font-medium ml-1 ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </p>
                    </div>
                    <p className="text-sm text-white/60">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {expandedDetails === activity.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-xs text-purple-300">AI Confidence: {activity.aiConfidence}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-white/5 flex flex-col items-center justify-center">
                        <Lock className="h-3 w-3 text-blue-400 mb-1" />
                        <span className="text-xs text-white/70">Encryption</span>
                        <span className="text-xs font-medium text-white">Active</span>
                      </div>
                      <div className="p-2 rounded bg-white/5 flex flex-col items-center justify-center">
                        <Shield className="h-3 w-3 text-green-400 mb-1" />
                        <span className="text-xs text-white/70">Risk Level</span>
                        <span className="text-xs font-medium text-white">
                          {activity.status === "verified" || activity.status === "completed" ? "Low" : 
                           activity.status === "flagged" ? "Medium" : "High"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/5 flex flex-col items-center justify-center">
                        <Info className="h-3 w-3 text-yellow-400 mb-1" />
                        <span className="text-xs text-white/70">Action</span>
                        <span className="text-xs font-medium text-white">
                          {activity.status === "blocked" ? "Blocked" : 
                           activity.status === "suspicious" || activity.status === "flagged" ? "Flagged" : "Allowed"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
