
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Wallet, Bell, User, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPressed, setIsPressed] = useState<string | null>(null);
  
  const navItems = [
    { icon: Home, path: "/dashboard", label: "Home" },
    { icon: Send, path: "/payments", label: "Send" },
    { icon: Wallet, path: "/cards", label: "Wallet" },
    { icon: Bell, path: "/notifications", label: "Alerts" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  const handleNavigate = (path: string) => {
    setIsPressed(path);
    setTimeout(() => setIsPressed(null), 300);
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-900 to-slate-800 shadow-lg border-t border-slate-700 backdrop-blur-lg"
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "flex flex-col items-center py-3 px-1 relative w-full touch-target",
                isActive ? "text-blue-400" : "text-slate-400"
              )}
            >
              <motion.div
                animate={isPressed === item.path ? { scale: 0.9 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </motion.div>
              {isActive && (
                <span className="absolute top-2 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
