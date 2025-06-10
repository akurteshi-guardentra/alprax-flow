
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Bell, Palette, Zap, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useDataSaverMode } from "@/hooks/use-data-saver";

const Settings = () => {
  const navigate = useNavigate();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  
  // Local state for settings
  const [settings, setSettings] = useState({
    notifications: true,
    two_factor_enabled: false,
    dark_mode: false,
    data_saver: isDataSaverEnabled,
    reduced_animations: !shouldAnimate,
    low_bandwidth_mode: false,
    biometric_auth: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key.replace('_', ' ')} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kosovo-blue via-kosovo-blue/90 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20 space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/70">Customize your experience</p>
          </div>

          <div className="grid gap-6">
            <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Push Notifications</span>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(value) => updateSetting('notifications', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Two-Factor Authentication</span>
                  <Switch
                    checked={settings.two_factor_enabled}
                    onCheckedChange={(value) => updateSetting('two_factor_enabled', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Biometric Authentication</span>
                  <Switch
                    checked={settings.biometric_auth}
                    onCheckedChange={(value) => updateSetting('biometric_auth', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Dark Mode</span>
                  <Switch
                    checked={settings.dark_mode}
                    onCheckedChange={(value) => updateSetting('dark_mode', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Reduced Animations</span>
                  <Switch
                    checked={settings.reduced_animations}
                    onCheckedChange={(value) => updateSetting('reduced_animations', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Data Saver Mode</span>
                  <Switch
                    checked={settings.data_saver}
                    onCheckedChange={(value) => updateSetting('data_saver', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Low Bandwidth Mode</span>
                  <Switch
                    checked={settings.low_bandwidth_mode}
                    onCheckedChange={(value) => updateSetting('low_bandwidth_mode', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
