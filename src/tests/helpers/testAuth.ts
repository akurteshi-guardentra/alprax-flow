
import { supabase } from '../../integrations/supabase/client';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

export async function ensureTestUser() {
  console.log('🔑 Ensuring test user is authenticated...');
  
  // Check if already signed in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('✅ Already authenticated as:', user.email);
    return user;
  }

  // Try to sign in with test credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (error) {
    console.error('❌ Authentication failed:', error.message);
    
    // Try to sign up if sign in fails
    console.log('🔄 Attempting to sign up test user...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (signupError) {
      console.error('❌ Sign up failed:', signupError.message);
      throw new Error('Could not authenticate test user');
    }

    console.log('✅ Test user signed up successfully');
    return signupData.user;
  }

  console.log('✅ Test user authenticated successfully');
  return data.user;
}
