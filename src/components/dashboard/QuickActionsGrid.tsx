
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, ArrowDownLeft, CreditCard, Users, TrendingUp, Clock, Shield } from "lucide-react";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { useStellarAccount } from "@/hooks/useStellarAccount";

const quickActions = [
  {
    icon: Send,
    title: "Send Money",
    description: "Transfer funds globally",
    color: "from-blue-500 to-purple-600",
    route: "/payments", // Now correctly routes to ModernPayments
    benefits: ["Instant transfers", "Low fees", "Global reach"],
    popular: true
  },
  {
    icon: ArrowDownLeft,
    title: "Request Money",
    description: "Generate payment request",
    color: "from-green-500 to-teal-600",
    route: "/request",
    benefits: ["Easy sharing", "QR codes", "Payment links"],
    popular: false
  },
  {
    icon: CreditCard,
    title: "Add Funds",
    description: "Top up your balance",
    color: "from-purple-500 to-pink-600",
    route: "/add-funds",
    benefits: ["Multiple methods", "Instant processing", "Secure"],
    popular: false
  },
  {
    icon: Users,
    title: "Contacts",
    description: "Manage recipients",
    color: "from-orange-500 to-red-600",
    route: "/contacts",
    benefits: ["Quick access", "Favorite recipients", "Payment history"],
    popular: false
  }
];

export function QuickActionsGrid() {
  const navigate = useNavigate();
  const { balance } = useStellarAccount();
  
  const accountBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const hasLowBalance = accountBalance < 10;

  const handleActionClick = (action: typeof quickActions[0]) => {
    // Show helpful guidance for users with low balance trying to send money
    if (action.route === "/payments" && hasLowBalance) {
      // Still navigate but user will see balance warning on payments page
    }
    navigate(action.route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        {hasLowBalance && (
          <div className="flex items-center gap-2 text-orange-300 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Consider adding funds</span>
          </div>
        )}
      </div>
      
      {/* Properly structured 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <ModernCard 
              variant="glass" 
              className={`relative bg-white/5 border border-white/10 group hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                action.popular ? 'ring-1 ring-blue-500/20' : ''
              }`}
              interactive={true}
              onClick={() => handleActionClick(action)}
            >
              <ModernCardContent className="p-3">
                {action.popular && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full text-[10px] z-10">
                    Popular
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white text-sm mb-1">{action.title}</h3>
                    <p className="text-white/60 text-xs leading-tight">{action.description}</p>
                  </div>
                  
                  {/* Simplified benefits display */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-green-400" />
                      <Shield className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ))}
      </div>
      
      {/* Helpful tip section - more compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="p-3 bg-white/5 rounded-lg border border-white/10"
      >
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3 h-3 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-medium text-xs mb-1">Pro Tip</h4>
            <p className="text-white/70 text-[11px] leading-tight">
              {hasLowBalance 
                ? "Add funds first for seamless transfers."
                : "Your account is ready for instant global transfers."
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
