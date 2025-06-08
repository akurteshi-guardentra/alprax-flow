
import { User, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profile";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { withResilience } from "@/utils/network-resilience";

interface ProfileAvatarProps {
  profile: Profile | null;
}

export const ProfileAvatar = ({ profile }: ProfileAvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  const { networkStatus } = useNetworkAwareLoading(false);

  // Determine image size based on network status and data saver mode
  const getImageQuality = (): string => {
    if (isDataSaverEnabled || networkStatus === 'poor') return 'low';
    if (isLowEndDevice) return 'medium';
    return 'high';
  };

  // Create optimized avatar URL with quality parameters
  const getOptimizedAvatarUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // If using Supabase storage, we can append quality params
    if (url.includes('supabase')) {
      const quality = getImageQuality();
      const qualityParam = quality === 'low' ? 'quality=40' : 
                         quality === 'medium' ? 'quality=70' : '';
      
      if (qualityParam && !url.includes('?')) {
        return `${url}?${qualityParam}`;
      }
    }
    return url;
  };

  const uploadAvatar = withResilience(
    async (file: File) => {
      if (!file) throw new Error("No file selected");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const filename = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${filename}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('profile')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    { maxRetries: 3, retryDelay: 1000 }
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size
    const maxSizeMB = isDataSaverEnabled ? 1 : 2; // 1MB in data saver mode, 2MB otherwise
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Avatar image must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.match('image/(jpeg|jpg|png|gif)')) {
      toast.error("Only JPEG, PNG and GIF formats are supported");
      return;
    }
    
    try {
      setUploading(true);
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Optimized display avatar or fallback
  const optimizedAvatarUrl = getOptimizedAvatarUrl(avatarUrl || profile?.avatar_url);

  return (
    <div className="flex justify-center mb-6">
      <motion.div 
        className="relative"
        initial={shouldAnimate ? { scale: 0.9, opacity: 0 } : undefined}
        animate={{ scale: 1, opacity: 1 }}
        transition={getTransition({ type: 'spring', stiffness: 300, damping: 25 })}
      >
        <div 
          className={`${isLowEndDevice ? 'w-20 h-20' : 'w-24 h-24'} rounded-full bg-white/10 flex items-center justify-center overflow-hidden`}
        >
          {optimizedAvatarUrl ? (
            <img 
              src={optimizedAvatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setAvatarUrl(null)}
            />
          ) : (
            <User className={`${isLowEndDevice ? 'h-10 w-10' : 'h-12 w-12'} text-white/60`} />
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
        />
        
        <Button 
          size="icon"
          className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};
