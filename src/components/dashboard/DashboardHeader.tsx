
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";

export function DashboardHeader() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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
          {greeting}
        </motion.h1>
        <p className="text-white/70 text-center sm:text-left">Welcome back to Alprax Flow</p>
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
          onClick={() => navigate("/profile")}
        >
          Profile
        </Button>
      </div>
    </motion.div>
  );
}
