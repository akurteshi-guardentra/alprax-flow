
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, ArrowDownLeft, CreditCard, Users } from "lucide-react";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";

const quickActions = [
  {
    icon: Send,
    title: "Send Money",
    description: "Transfer funds globally",
    color: "from-blue-500 to-purple-600",
    route: "/payments"
  },
  {
    icon: ArrowDownLeft,
    title: "Request Money",
    description: "Generate payment request",
    color: "from-green-500 to-teal-600",
    route: "/request"
  },
  {
    icon: CreditCard,
    title: "Add Funds",
    description: "Top up your balance",
    color: "from-purple-500 to-pink-600",
    route: "/add-funds"
  },
  {
    icon: Users,
    title: "Contacts",
    description: "Manage recipients",
    color: "from-orange-500 to-red-600",
    route: "/contacts"
  }
];

export function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <ModernCard 
              variant="glass" 
              className="bg-white/5 border border-white/10"
              interactive={true}
              onClick={() => navigate(action.route)}
            >
              <ModernCardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{action.title}</h3>
                <p className="text-white/60 text-xs">{action.description}</p>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
