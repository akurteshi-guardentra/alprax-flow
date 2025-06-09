
import { motion } from "framer-motion";
import { Bitcoin, Shield, Lock, Cpu, Code } from "lucide-react";

export function TechBadges() {
  const badges = [
    { 
      icon: Shield, 
      text: "Advanced Security", 
      className: "bg-green-600/20 border-green-500/40 text-green-400" 
    },
    { 
      icon: Bitcoin, 
      text: "Web3 Powered", 
      className: "bg-orange-600/20 border-orange-500/40 text-orange-400" 
    },
    { 
      icon: Cpu, 
      text: "AI Driven", 
      className: "bg-blue-600/20 border-blue-500/40 text-blue-400" 
    },
    { 
      icon: Lock, 
      text: "End-to-End Encrypted", 
      className: "bg-purple-600/20 border-purple-500/40 text-purple-400" 
    },
    { 
      icon: Code, 
      text: "Blockchain Technology", 
      className: "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" 
    }
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap gap-2"
    >
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${badge.className}`}
        >
          <badge.icon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{badge.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
