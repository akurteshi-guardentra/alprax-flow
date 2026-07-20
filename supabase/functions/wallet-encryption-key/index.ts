import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

/**
 * Returns a per-user wallet encryption key derived via HKDF from a
 * server-only master secret (WALLET_MASTER_KEY) and the authenticated
 * user's id. The master key is never sent to the client, so an
 * attacker who obtains encrypted_secret + user id/email/created_at
 * cannot reconstruct the decryption key.
 */
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
    const masterKey = Deno.env.get('WALLET_MASTER_KEY');
    if (!masterKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error } = await client.auth.getUser();
    if (error || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const enc = new TextEncoder();
    const ikm = enc.encode(masterKey);
    const info = enc.encode(`alprax:wallet:${userData.user.id}`);
    const salt = enc.encode('alprax-wallet-hkdf-v1');

    const baseKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      baseKey,
      256
    );

    // Return as base64 - client uses this as PBKDF2/HKDF input material
    const bytes = new Uint8Array(bits);
    const b64 = btoa(String.fromCharCode(...bytes));

    return new Response(JSON.stringify({ key: b64 }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('wallet-encryption-key error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
