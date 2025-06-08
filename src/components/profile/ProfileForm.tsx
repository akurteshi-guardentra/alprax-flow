
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Save } from "lucide-react";
import { FullNameField } from "./form-fields/FullNameField";
import { PhoneNumberField } from "./form-fields/PhoneNumberField";
import { CountryField } from "./form-fields/CountryField";
import { LanguageField } from "./form-fields/LanguageField";
import { Shield, ExternalLink, AlertTriangle } from "lucide-react";
import { useKYC } from "@/hooks/useKYC";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { motion } from "framer-motion";
import { withResilience } from "@/utils/network-resilience";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { requestOptimize } from "@/utils/request-optimization";
import { useMobile } from "@/hooks/use-mobile";
import { useDataSaverMode } from "@/hooks/use-data-saver";

interface ProfileFormProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const ProfileForm = ({ profile, setProfile }: ProfileFormProps) => {
  const navigate = useNavigate();  const [loading, setLoading] = useState(false);
  const { status: kycStatus, documents } = useKYC();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isMobile } = useMobile();
  const { isLowEndDevice } = useDataSaverMode();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store the original profile on initial load to detect changes
  useEffect(() => {
    if (profile && !originalProfile) {
      setOriginalProfile({...profile});
    }
  }, [profile]);
  // Detect changes between current and original profile
  useEffect(() => {
    if (profile && originalProfile) {
      const hasChanges = 
        profile.full_name !== originalProfile.full_name ||
        profile.phone_number !== originalProfile.phone_number ||
        profile.country !== originalProfile.country ||
        profile.preferred_language !== originalProfile.preferred_language;
      
      setHasUnsavedChanges(hasChanges);
      
      // Set up auto save if enabled and there are changes
      if (autoSaveEnabled && hasChanges) {
        // Clear any existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        // Create new timer to save after 2 seconds of inactivity
        autoSaveTimerRef.current = setTimeout(() => {
          handleAutoSave();
        }, 2000);
      }
    }
    
    // Cleanup timer when component unmounts
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [profile, originalProfile, autoSaveEnabled]);
  
  // Auto-save function
  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !profile) return;
    
    try {
      setAutoSaving(true);
      
      await updateProfile({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        country: profile.country,
        preferred_language: profile.preferred_language,
      });
      
      // Update original profile after successful save
      setOriginalProfile({...profile});
      setHasUnsavedChanges(false);
      
      // Show subtle toast notification
      toast.success('Profile saved automatically', {
        duration: 2000,
        style: { backgroundColor: 'rgba(0,0,0,0.7)' }
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save to avoid disrupting UX
    } finally {
      setAutoSaving(false);
    }
  };

  // Use resilient API for profile updates
  const updateProfile = withResilience(
    async (profileData: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Optimize network request
      return requestOptimize(
        async () => {
          const { error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);

          if (error) throw error;
          return { success: true };
        },
        { 
          key: `profile_update_${user.id}`, 
          deduplicate: true 
        }
      );
    },
    { 
      maxRetries: 3, 
      retryDelay: 1000,
      cacheTime: 0 // Don't cache profile updates
    }
  );

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      await updateProfile({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        country: profile.country,
        preferred_language: profile.preferred_language,
      });

      // Update original profile after successful save
      setOriginalProfile({...profile});
      setHasUnsavedChanges(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={shouldAnimate ? { opacity: 0 } : undefined}
      animate={{ opacity: 1 }}
      transition={getTransition({ duration: 0.3 })}
    >
      <div className="grid gap-5">
        <FullNameField profile={profile} setProfile={setProfile} />
        <PhoneNumberField profile={profile} setProfile={setProfile} />
        <CountryField profile={profile} setProfile={setProfile} />
        <LanguageField profile={profile} setProfile={setProfile} />
      </div>

      {hasUnsavedChanges && (
        <motion.div 
          className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200 flex items-center gap-2"
          initial={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
          animate={{ opacity: 1, height: 'auto' }}
          transition={getTransition({ duration: 0.3 })}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>You have unsaved changes</span>
        </motion.div>
      )}      <div className="pt-2">
        <Button 
          onClick={handleSave}
          disabled={loading || autoSaving || !hasUnsavedChanges}
          className={`w-full ${
            hasUnsavedChanges ? "bg-primary hover:bg-primary/90" : "bg-gray-500/50"
          } text-white transition-colors h-11`}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : autoSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Auto-saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <div className="text-xs flex items-center justify-center gap-2 text-white/60">
        <input
          type="checkbox"
          checked={autoSaveEnabled}
          onChange={(e) => setAutoSaveEnabled(e.target.checked)}
          className="rounded border-white/20 bg-white/10 text-primary"
        />
        <span>Enable auto-save</span>
      </div>

      <div className={`pt-2 ${isLowEndDevice ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-3"}`}>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 text-white"
          onClick={() => navigate('/kyc')}
        >
          <Shield className="h-4 w-4" />
          {isMobile ? 'KYC Verification' : `KYC Status: ${kycStatus ? kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1) : 'Not Started'}`}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 text-white"
          onClick={() => navigate('/settings')}
        >
          <ExternalLink className="h-4 w-4" />
          Advanced Settings
        </Button>
      </div>
    </motion.div>
  );
};
