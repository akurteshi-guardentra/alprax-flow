import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FamilyGroup, FamilyMember } from '@/types/diaspora';

export function useFamilyGroups() {
  const queryClient = useQueryClient();

  const { data: familyGroups, isLoading } = useQuery({
    queryKey: ['family-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          family_members(
            id,
            user_id,
            role,
            contribution_amount,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createFamilyGroup = useMutation({
    mutationFn: async (groupData: {
      name: string;
      description?: string;
      monthlyGoal?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('family_groups')
        .insert([{
          creator_id: user.id,
          name: groupData.name,
          description: groupData.description,
          group_code: groupCode,
          monthly_goal: groupData.monthlyGoal || 0,
          total_savings: 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('family_members')
        .insert([{
          family_group_id: data.id,
          user_id: user.id,
          role: 'admin',
          contribution_amount: 0
        }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      toast.success('Family group created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create family group');
      console.error('Family group error:', error);
    },
  });

  const joinFamilyGroup = useMutation({
    mutationFn: async (groupCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find the group by code
      const { data: group, error: groupError } = await supabase
        .from('family_groups')
        .select('id')
        .eq('group_code', groupCode)
        .single();

      if (groupError) throw new Error('Invalid group code');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) throw new Error('Already a member of this group');

      // Add as member
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_group_id: group.id,
          user_id: user.id,
          role: 'member',
          contribution_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      toast.success('Successfully joined family group');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to join family group');
    },
  });

  const updateContribution = useMutation({
    mutationFn: async ({ groupId, amount }: { groupId: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .update({ contribution_amount: amount })
        .eq('family_group_id', groupId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update group total savings
      const { data: members } = await supabase
        .from('family_members')
        .select('contribution_amount')
        .eq('family_group_id', groupId);

      const totalSavings = members?.reduce((sum, member) => sum + member.contribution_amount, 0) || 0;

      await supabase
        .from('family_groups')
        .update({ total_savings: totalSavings })
        .eq('id', groupId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      toast.success('Contribution updated successfully');
    },
  });

  return {
    familyGroups,
    isLoading,
    createFamilyGroup: createFamilyGroup.mutate,
    joinFamilyGroup: joinFamilyGroup.mutate,
    updateContribution: updateContribution.mutate,
    isCreating: createFamilyGroup.isPending,
    isJoining: joinFamilyGroup.isPending,
  };
}