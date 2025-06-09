import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Settings as SettingsIcon, Bell, Shield, Moon, Globe, 
  CreditCard, Info, Smartphone, Wifi, AlertTriangle, Eye, RefreshCw,
  LogOut, Save
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { withResilience } from "@/utils/network-resilience";

interface UserSettings {
  notifications: boolean;
  twoFactor: boolean;
  darkMode: boolean;
  dataSaver: boolean;
  reducedAnimations: boolean;
  lowBandwidthMode: boolean;
  biometricAuth: boolean;
}

const defaultSettings: UserSettings = {
  notifications: true,
  twoFactor: false,
  darkMode: true,
  dataSaver: false,
  reducedAnimations: false,
  lowBandwidthMode: false,
  biometricAuth: false,
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  
  const { shouldAnimate, getTransition, toggleReduceMotion } = useOptimizedAnimations();
  const { isDataSaverEnabled, toggleDataSaver } = useDataSaverMode();
  const { isMobile } = useMobile();
  const { networkStatus } = useNetworkAwareLoading(loading);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user settings from the database
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
          throw error;
        }

        // If settings exist, use them
        if (data) {
          const loadedSettings = {
            notifications: data.notifications ?? true,
            twoFactor: data.two_factor_enabled ?? false,
            darkMode: data.dark_mode ?? true,
            dataSaver: data.data_saver ?? false,
            reducedAnimations: data.reduced_animations ?? false,
            lowBandwidthMode: data.low_bandwidth_mode ?? false,
            biometricAuth: data.biometric_auth ?? false,
          };
          
          setSettings(loadedSettings);
          setOriginalSettings(loadedSettings);
        } else {
          // If no settings found, use defaults and create a record
          await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              notifications: defaultSettings.notifications,
              two_factor_enabled: defaultSettings.twoFactor,
              dark_mode: defaultSettings.darkMode,
              data_saver: defaultSettings.dataSaver,
              reduced_animations: defaultSettings.reducedAnimations,
              low_bandwidth_mode: defaultSettings.lowBandwidthMode,
              biometric_auth: defaultSettings.biometricAuth,
            });
          
          setSettings(defaultSettings);
          setOriginalSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using defaults.",
          variant: "destructive",
        });
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [navigate]);

  // Detect changes between current and original settings
  useEffect(() => {
    if (originalSettings) {
      const hasChanges = Object.keys(settings).some(
        key => settings[key as keyof UserSettings] !== originalSettings[key as keyof UserSettings]
      );
      setHasUnsavedChanges(hasChanges);
    }
  }, [settings, originalSettings]);

  // Update a single setting
  const updateSetting = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Also update the relevant context if needed
    if (key === 'dataSaver') toggleDataSaver(value);
    if (key === 'reducedAnimations') toggleReduceMotion(value);
  };

  // Save all settings
  const handleSave = withResilience(async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notifications: settings.notifications,
          two_factor_enabled: settings.twoFactor,
          dark_mode: settings.darkMode,
          data_saver: settings.dataSaver,
          reduced_animations: settings.reducedAnimations,
          low_bandwidth_mode: settings.lowBandwidthMode,
          biometric_auth: settings.biometricAuth,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Update original settings after successful save
      setOriginalSettings({...settings});
      setHasUnsavedChanges(false);
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, { maxRetries: 2, retryDelay: 1000 });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-kosovo-blue dark:via-kosovo-blue/90 dark:to-red-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-slate-700 dark:text-white hover:bg-slate-200/50 dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition({ duration: 0.4 })}
          className="pt-20"
        >
          <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-white/5 dark:border-white/10">
            <CardHeader className="border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 w-9 h-9"></div>
                        <div>
                          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                      <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Security Settings Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Security
                    </h3>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.1 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                          <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.twoFactor} 
                        onCheckedChange={(checked) => updateSetting('twoFactor', checked)} 
                      />
                    </motion.div>

                    {settings.twoFactor && (
                      <motion.div
                        className="ml-12 -mt-2 mb-2"
                        initial={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={getTransition({ duration: 0.3 })}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5"
                          onClick={() => navigate('/setup-2fa')}
                        >
                          Configure 2FA
                        </Button>
                      </motion.div>
                    )}                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.15 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30">
                          <Smartphone className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Biometric Authentication</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Use fingerprint or face ID to login</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.biometricAuth} 
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Navigate to setup page instead of directly toggling
                            navigate('/biometric-setup');
                            return;
                          }
                          updateSetting('biometricAuth', checked);
                        }}
                      />
                    </motion.div>
                    
                    {settings.biometricAuth && (
                      <motion.div
                        className="ml-12 -mt-2 mb-2"
                        initial={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={getTransition({ duration: 0.3 })}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5"
                          onClick={() => navigate('/biometric-setup')}
                        >
                          Manage Biometric Auth
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  {/* Notifications Settings Section */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Notifications
                    </h3>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.2 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
                          <Bell className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Push Notifications</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about important events</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.notifications} 
                        onCheckedChange={(checked) => updateSetting('notifications', checked)}
                      />
                    </motion.div>
                  </div>

                  {/* Appearance Settings Section */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Appearance
                    </h3>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.25 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                          <Moon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Dark Mode</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.darkMode} 
                        onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.3 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30">
                          <Globe className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Language</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred language</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "default"}
                        className="bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10"
                        onClick={() => navigate('/language')}
                      >
                        English
                      </Button>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.35 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-900/30">
                          <RefreshCw className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Reduced Animations</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Use simpler visual effects</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.reducedAnimations} 
                        onCheckedChange={(checked) => updateSetting('reducedAnimations', checked)}
                      />
                    </motion.div>
                  </div>

                  {/* Performance Settings Section */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Performance
                    </h3>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.4 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/30">
                          <Eye className="h-5 w-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Data Saver Mode</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Reduce data usage throughout the app</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.dataSaver} 
                        onCheckedChange={(checked) => updateSetting('dataSaver', checked)}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.45 })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30">
                          <Wifi className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                        </div>
                        <div>
                          <Label className="text-slate-800 dark:text-white font-medium">Low Bandwidth Mode</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Optimize for slow connections</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.lowBandwidthMode} 
                        onCheckedChange={(checked) => updateSetting('lowBandwidthMode', checked)}
                      />
                    </motion.div>
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-3 pt-4">
                    <motion.div
                      className="flex flex-col sm:flex-row gap-3"
                      initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ delay: 0.5 })}
                    >
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
                        onClick={() => navigate('/profile')}
                      >
                        Manage Profile
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={async () => {
                          await supabase.auth.signOut();
                          navigate('/login');
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </div>

                  {/* Save Button */}
                  {hasUnsavedChanges && (
                    <motion.div 
                      className="pt-4"
                      initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ duration: 0.3 })}
                    >
                      <Button 
                        onClick={handleSave}
                        disabled={saving || !hasUnsavedChanges}
                        className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                  
                  {/* Warning for low network quality */}
                  {networkStatus === 'poor' && (
                    <motion.div 
                      className="mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-2 items-start"
                      initial={shouldAnimate ? { opacity: 0 } : undefined}
                      animate={{ opacity: 1 }}
                    >
                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">Network connection is poor</p>
                        <p className="text-xs text-yellow-400/80">Consider enabling Low Bandwidth Mode for better experience</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
