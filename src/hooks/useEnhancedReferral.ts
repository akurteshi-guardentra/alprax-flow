import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EnhancedReferralCode, ReferralAnalytics } from '@/types/diaspora';

export function useEnhancedReferral() {
  const queryClient = useQueryClient();

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ['enhanced-referral-code'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as EnhancedReferralCode;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['referral-analytics', referralCode?.id],
    queryFn: async () => {
      if (!referralCode) return null;

      // Get clicks data
      const { data: clicks } = await supabase
        .from('referral_clicks')
        .select('*')
        .eq('referral_code_id', referralCode.id);

      // Calculate analytics
      const totalClicks = clicks?.length || 0;
      const totalConversions = clicks?.filter(c => c.converted).length || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const totalEarnings = referralCode.rewards_earned;

      // Monthly stats (simplified - would need more complex query in production)
      const monthlyStats = [
        { month: 'Jan', clicks: 12, conversions: 3, earnings: 45 },
        { month: 'Feb', clicks: 18, conversions: 5, earnings: 75 },
        { month: 'Mar', clicks: 25, conversions: 8, earnings: 120 }
      ];

      // Tier progress
      const tierThresholds = { bronze: 0, silver: 10, gold: 50, platinum: 100 };
      const currentTier = referralCode.tier_level;
      const nextTier = currentTier === 'bronze' ? 'silver' : 
                      currentTier === 'silver' ? 'gold' : 
                      currentTier === 'gold' ? 'platinum' : 'platinum';
      
      const currentThreshold = tierThresholds[currentTier];
      const nextThreshold = tierThresholds[nextTier];
      const progressPercentage = nextTier !== 'platinum' ? 
        ((totalConversions - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;

      return {
        totalClicks,
        totalConversions,
        conversionRate,
        totalEarnings,
        monthlyStats,
        tierProgress: {
          current: currentTier,
          next: nextTier,
          progressPercentage: Math.min(progressPercentage, 100),
          nextTierRequirement: nextThreshold - totalConversions
        }
      } as ReferralAnalytics;
    },
    enabled: !!referralCode,
  });

  const generateReferralCode = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const referralLink = `${window.location.origin}/ref/${code}`;
      
      const { data, error } = await supabase
        .from('referral_codes')
        .insert([{ 
          code, 
          user_id: user.id,
          referral_link: referralLink,
          total_clicks: 0,
          successful_conversions: 0,
          family_bonus_multiplier: 1.0,
          tier_level: 'bronze',
          monthly_referrals: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-referral-code'] });
      toast.success('Enhanced referral code generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate referral code');
      console.error('Referral code error:', error);
    },
  });

  const generateQRCode = useMutation({
    mutationFn: async () => {
      if (!referralCode) throw new Error('No referral code found');
      
      // In a real implementation, you'd generate a QR code image
      // For now, we'll just update the URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${referralCode.referral_link}`;
      
      const { data, error } = await supabase
        .from('referral_codes')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', referralCode.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-referral-code'] });
      toast.success('QR code generated successfully');
    },
  });

  const trackClick = useMutation({
    mutationFn: async (clickData: { country?: string; userAgent?: string }) => {
      if (!referralCode) throw new Error('No referral code found');

      const { error } = await supabase
        .from('referral_clicks')
        .insert([{
          referral_code_id: referralCode.id,
          country: clickData.country,
          user_agent: clickData.userAgent,
          converted: false,
          conversion_value: 0
        }]);

      if (error) throw error;

      // Update total clicks
      await supabase
        .from('referral_codes')
        .update({ total_clicks: referralCode.total_clicks + 1 })
        .eq('id', referralCode.id);
    },
  });

  return {
    referralCode,
    analytics,
    isLoading,
    generateReferralCode: generateReferralCode.mutate,
    generateQRCode: generateQRCode.mutate,
    trackClick: trackClick.mutate,
    isGenerating: generateReferralCode.isPending,
    isGeneratingQR: generateQRCode.isPending,
  };
}