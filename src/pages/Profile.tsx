
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile as ProfileType } from "@/types/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileCompletionCard } from "@/components/profile/ProfileCompletionCard";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isLoadingWithFallback } = useNetworkAwareLoading(loading);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no profile exists, create one with default values
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            full_name: '',
            avatar_url: null,
            phone_number: null,
            country: null,
            preferred_language: null,
            kyc_level: 'basic'
          }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const getKycBadgeColor = (kycLevel: string | null) => {
    switch (kycLevel) {
      case 'verified':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'basic':
      default:
        return 'bg-blue-500';
    }
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
          className="pt-20"
        >
          <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                Profile Management
              </CardTitle>
              {profile?.kyc_level && (
                <Badge 
                  variant="secondary"
                  className={`${getKycBadgeColor(profile.kyc_level)} text-white`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  KYC Level: {profile.kyc_level.charAt(0).toUpperCase() + profile.kyc_level.slice(1)}
                </Badge>
              )}
            </CardHeader>            <CardContent>
              <ProfileAvatar profile={profile} />
              <div className="mb-6">
                <ProfileCompletionCard 
                  profile={profile}
                  onAddMissing={(field) => {
                    // Scroll to the form
                    if (formRef.current) {
                      formRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>              <div ref={formRef}>
                <ProfileForm profile={profile} setProfile={setProfile} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
