
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      toast.success("Logged out successfully");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 text-center sm:text-left"
    >
      <div className="text-center sm:text-left w-full sm:w-auto">
        <AlpraxBrandHeader size="sm" className="mb-2 text-center sm:text-left" />
        <motion.h1 
          className="text-2xl font-bold text-white text-center sm:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {greeting}, {getUserName()}
        </motion.h1>
        <p className="text-white/70 text-center sm:text-left">Welcome back to Alprax Flow</p>
      </div>
      <div className="flex items-center gap-3 justify-center">
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-white/5 flex items-center justify-center"
          onClick={() => navigate("/profile")}
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          variant="outline"
          className="border-red-500/30 text-red-300 hover:bg-red-500/10 bg-red-500/5 flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </motion.div>
  );
}
