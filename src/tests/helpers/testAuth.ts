// Helper for test user authentication
import { supabase } from '@/integrations/supabase/client';

// Test credentials - use environment variables in a real app
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

export async function ensureTestUser() {
  console.log('🔑 Setting up test user authentication...');
  
  // First check if already authenticated
  const { data: { user: existingUser } } = await supabase.auth.getUser();
  if (existingUser) {
    console.log('✅ Already authenticated as:', existingUser.email);
    return existingUser;
  }
  
  // Try to sign in first
  let user = await trySignIn();
  
  // If sign-in fails, try to sign up
  if (!user) {
    user = await trySignUp();
  }
  
  // If still no user, try one more sign-in (in case signup succeeded but didn't return user)
  if (!user) {
    user = await trySignIn();
  }
  
  if (!user) {
    throw new Error('Could not authenticate or create test user after multiple attempts');
  }
  
  return user;
}

async function trySignIn() {
  try {
    console.log('Attempting to sign in with test credentials...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.log('🔶 Sign-in failed:', error.message);
      return null;
    }
    
    console.log('✅ Test user signed in successfully');
    return data.user;
  } catch (error) {
    console.error('❌ Exception during sign-in:', error);
    return null;
  }
}

async function trySignUp() {
  try {
    console.log('🔄 Attempting to sign up test user...');
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return null;
    }
    
    console.log('✅ Test user signed up successfully');
    return data.user;
  } catch (error) {
    console.error('❌ Exception during sign-up:', error);
    return null;
  }
}
