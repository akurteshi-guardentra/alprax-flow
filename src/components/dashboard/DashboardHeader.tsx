
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Bell, Settings, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");
  const [showQuickTips, setShowQuickTips] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    
    // Show helpful tips for new users
    const isNewUser = !localStorage.getItem('dashboard_visited');
    if (isNewUser) {
      setShowQuickTips(true);
      localStorage.setItem('dashboard_visited', 'true');
    }
  }, []);

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      toast.success("Logged out successfully - See you soon!");
      navigate("/welcome");
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "there";
  };

  const getUserStatus = () => {
    // Simple logic to determine user engagement
    const lastLogin = localStorage.getItem('last_login');
    const isReturningUser = lastLogin && Date.now() - parseInt(lastLogin) > 24 * 60 * 60 * 1000;
    return isReturningUser ? "Welcome back" : "Ready to transact";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 mb-8"
    >
      {/* Main header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <AlpraxBrandHeader size="sm" />
          
          {/* Mobile-first action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3"
              onClick={() => toast.info("Help center coming soon!")}
            >
              <HelpCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Help</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3"
              onClick={() => toast.info("Notifications coming soon!")}
            >
              <Bell className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Alerts</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5 transition-all duration-300 hover:scale-105 px-2 sm:px-3"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-300 hover:bg-red-500/10 bg-red-500/5 transition-all duration-300 hover:scale-105 px-2 sm:px-3"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {greeting}, {getUserName()}! 👋
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base text-white/70">{getUserStatus()}</p>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      </div>
      
      {/* Quick tips for new users */}
      {showQuickTips && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.5 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">Quick Start Guide</span>
              </h3>
              <div className="space-y-1 text-xs text-white/80">
                <p>• <strong>Send Money:</strong> Transfer funds globally with low fees</p>
                <p>• <strong>Add Funds:</strong> Top up your balance using multiple payment methods</p>
                <p className="hidden sm:block">• <strong>Contacts:</strong> Save recipients for faster future transactions</p>
                <p className="hidden sm:block">• <strong>Security:</strong> Your account is protected with advanced encryption</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickTips(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
            >
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
