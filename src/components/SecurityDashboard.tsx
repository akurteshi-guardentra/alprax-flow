
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Cpu, Check, AlertTriangle, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { useTransferImpact } from "@/hooks/useTransferImpact";

export function SecurityDashboard() {
  const { stats, isLoading } = useTransferImpact();
  
  // Security stats - in a real app these would come from an API
  const securityStats = {
    activeMonitoring: true,
    threatsPrevented: 27,
    securityScore: 94,
    lastScan: new Date().toLocaleDateString(),
    encryptionStatus: "Quantum-Resistant",
    aiAnalysis: "Active"
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          Security Dashboard
        </CardTitle>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
          <Check className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs text-green-400">Protected</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <SecurityMetric 
            icon={Shield} 
            title="Security Score" 
            value={`${securityStats.securityScore}%`} 
            color="blue"
          />
          <SecurityMetric 
            icon={AlertTriangle} 
            title="Threats Prevented" 
            value={securityStats.threatsPrevented} 
            color="yellow"
          />
          <SecurityMetric 
            icon={Cpu} 
            title="AI Monitoring" 
            value={securityStats.aiAnalysis} 
            color="purple"
          />
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-blue-900/30 to-blue-700/30 rounded-lg border border-blue-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                <h4 className="text-sm font-medium text-white">Blockchain Security</h4>
              </div>
              <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full">
                <Cpu className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-300">AI Enhanced</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
              <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                <span>Encryption</span>
                <span className="text-green-400">{securityStats.encryptionStatus}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                <span>Last Security Scan</span>
                <span className="text-blue-400">{securityStats.lastScan}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                <span>Transfer Protection</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                <span>Fraud Prevention</span>
                <span className="text-green-400">AI-Powered</span>
              </div>
            </div>
          </div>

          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gradient-to-r from-green-900/30 to-green-700/30 rounded-lg border border-green-700/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-green-400" />
                <h4 className="text-sm font-medium text-white">Transaction Impact Summary</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                  <span>Fees Saved</span>
                  <span className="text-green-400">${stats.totalFeeSaved.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                  <span>Time Saved</span>
                  <span className="text-green-400">{stats.totalTimeSaved} minutes</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                  <span>Carbon Footprint</span>
                  <span className="text-green-400">-{stats.totalCarbonSaved.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                  <span>AI Optimization</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityMetric({ 
  icon: Icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  title: string; 
  value: string | number; 
  color: "blue" | "green" | "yellow" | "purple" | "red";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className="h-6 w-6 mb-1" />
        <h3 className="text-xs font-medium text-white/80">{title}</h3>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}
