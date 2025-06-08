
import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export function SecurityInsightsPanel() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Multi-layered Protection",
      description: "Our platform utilizes cutting-edge encryption and multi-factor authentication to ensure your transactions are secure.",
      className: "bg-gradient-to-br from-green-900/30 to-green-700/30"
    },
    {
      icon: Lock,
      title: "Blockchain Security",
      description: "Web3 technology provides immutable transaction records and enhanced privacy compared to traditional transfers.",
      className: "bg-gradient-to-br from-blue-900/30 to-blue-700/30"
    },
    {
      icon: AlertTriangle,
      title: "Fraud Detection",
      description: "AI-powered systems continuously monitor transactions to detect and prevent fraudulent activities in real-time.",
      className: "bg-gradient-to-br from-yellow-900/30 to-yellow-700/30"
    },
    {
      icon: CheckCircle,
      title: "Compliance Standards",
      description: "Our platform adheres to global security standards and regulations to ensure secure and compliant transfers.",
      className: "bg-gradient-to-br from-purple-900/30 to-purple-700/30"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Advanced Security & Compliance</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Our AI-driven security systems and blockchain technology work together to provide unparalleled protection
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`p-5 rounded-xl border border-white/10 ${feature.className}`}
          >
            <div className="flex gap-4">
              <div className="p-2 bg-white/10 rounded-lg h-fit">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 mt-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
          <p className="text-white/80 text-sm">
            Our cybersecurity infrastructure is continuously monitored and updated to address emerging threats, providing you with peace of mind for every transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
