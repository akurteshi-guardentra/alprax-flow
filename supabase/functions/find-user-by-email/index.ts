import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();

    // Basic validation
    if (!email || email.length < 5 || email.length > 255 || !email.includes('@') || email.includes('%') || email.includes('_')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service-role client via the hardened SECURITY DEFINER RPC
    const admin = createClient(supabaseUrl, serviceKey);
    // Cannot call find_user_by_email as service role (checks auth.uid()), so query directly
    const { data: authUser, error: e1 } = await admin
      .schema('auth' as any)
      .from('users' as any)
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (e1 || !authUser || (authUser as any).id === userData.user.id) {
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: stellar } = await admin
      .from('stellar_accounts')
      .select('id')
      .eq('user_id', (authUser as any).id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        data: [
          {
            user_id: (authUser as any).id,
            email: (authUser as any).email,
            has_stellar_account: !!stellar,
          },
        ],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('find-user-by-email error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
