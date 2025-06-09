
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error(error.message);
    return false;
  }
  return true;
}

export async function checkAuthStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}
