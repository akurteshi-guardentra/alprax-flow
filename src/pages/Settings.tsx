
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Palette, Globe, User, Lock, CreditCard, BarChart3, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    transfers: true,
    security: true,
    marketing: false,
    updates: true
  });

  const settingsCategories = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile Information", action: () => navigate('/profile'), description: "Update your personal details" },
        { label: "Verification Status", action: () => navigate('/verify'), description: "Complete KYC verification" },
        { label: "Payment Methods", action: () => navigate('/cards'), description: "Manage cards and accounts" }
      ]
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        { label: "Two-Factor Authentication", action: () => {}, description: "Add extra security to your account" },
        { label: "Biometric Login", action: () => {}, description: "Use fingerprint or face recognition" },
        { label: "Change Password", action: () => {}, description: "Update your login password" }
      ]
    },
    {
      title: "Analytics & Insights",
      icon: BarChart3,
      items: [
        { label: "Transaction Analytics", action: () => navigate('/analytics'), description: "View spending patterns and insights" },
        { label: "Monthly Reports", action: () => {}, description: "Download detailed transaction reports" },
        { label: "Budget Tracking", action: () => {}, description: "Set and monitor spending limits" }
      ]
    },
    {
      title: "Preferences",
      icon: Palette,
      items: [
        { label: "Language & Region", action: () => {}, description: "English (US)" },
        { label: "Currency Display", action: () => {}, description: "EUR - Euro" },
        { label: "Time Zone", action: () => {}, description: "UTC+1 (Central European Time)" }
      ]
    },
    {
      title: "Mobile Features",
      icon: Smartphone,
      items: [
        { label: "Push Notifications", action: () => {}, description: "Manage mobile alerts" },
        { label: "Biometric Security", action: () => {}, description: "Touch ID / Face ID settings" },
        { label: "Offline Mode", action: () => {}, description: "Access recent transactions offline" }
      ]
    }
  ];

  return (
    <UnifiedLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Settings Categories */}
        {settingsCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-blue-400" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10"
                    onClick={item.action}
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.label}</h4>
                      <p className="text-white/60 text-sm">{item.description}</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Notifications with fixed toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium capitalize">{key}</p>
                    <p className="text-white/60 text-sm">
                      Receive notifications about {key.toLowerCase()}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-white/20"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Support & Legal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Support & Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Help Center", action: () => navigate('/help'), description: "Get help and support" },
                { label: "Contact Support", action: () => navigate('/help'), description: "Reach out to our team" },
                { label: "Terms & Privacy", action: () => {}, description: "Legal information and policies" },
                { label: "About AlpraxFlow", action: () => {}, description: "Learn more about our platform" }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10"
                  onClick={item.action}
                >
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.label}</h4>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-medium mb-2">AlpraxFlow</h3>
              <p className="text-white/60 text-sm">Version 1.0.0 • Powered by Stellar</p>
              <p className="text-white/40 text-xs mt-2">Built for the future of finance</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Settings;
