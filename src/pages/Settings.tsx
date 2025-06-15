
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, Shield, Bell, Palette, Globe, User, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

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
        { label: "Profile Information", action: () => navigate('/profile') },
        { label: "KYC Verification", action: () => navigate('/kyc') },
        { label: "Payment Methods", action: () => navigate('/payments') }
      ]
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        { label: "Two-Factor Authentication", action: () => navigate('/setup-2fa') },
        { label: "Biometric Login", action: () => navigate('/biometric-setup') },
        { 
          label: "Change Password", 
          action: () => toast.info("Password change functionality coming soon!")
        }
      ]
    },
    {
      title: "Preferences",
      icon: Palette,
      items: [
        { 
          label: "Language", 
          action: () => toast.info("Language settings coming soon!")
        },
        { 
          label: "Currency", 
          action: () => toast.info("Currency preferences coming soon!")
        },
        { 
          label: "Time Zone", 
          action: () => toast.info("Time zone settings coming soon!")
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="glass-card-hover text-white border-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gradient-modern flex items-center gap-3">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
          </motion.div>

          <div className="space-y-8">
            {/* Settings Categories */}
            {settingsCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className="glass-card modern-shadow">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-blue-400" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-3 glass-card-hover cursor-pointer"
                        onClick={item.action}
                      >
                        <span className="text-white/90">{item.label}</span>
                        <ArrowLeft className="h-4 w-4 text-white/60 rotate-180" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card modern-shadow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-white/90 capitalize">{key}</p>
                        <p className="text-white/60 text-sm">
                          Receive notifications about {key}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => {
                          setNotifications(prev => ({ ...prev, [key]: checked }));
                          toast.success(`${key} notifications ${checked ? 'enabled' : 'disabled'}`);
                        }}
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
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card modern-shadow">
                <CardHeader>
                  <CardTitle className="text-white">Support & Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Help Center", action: () => navigate('/help') },
                    { 
                      label: "Contact Support", 
                      action: () => toast.info("Contact support: support@alpraxflow.com")
                    },
                    { 
                      label: "Terms & Privacy", 
                      action: () => toast.info("Terms and Privacy coming soon!")
                    },
                    { 
                      label: "About", 
                      action: () => toast.info("AlpraxFlow v1.0 - Modern payment solution")
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 glass-card-hover cursor-pointer"
                      onClick={item.action}
                    >
                      <span className="text-white/90">{item.label}</span>
                      <ArrowLeft className="h-4 w-4 text-white/60 rotate-180" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
