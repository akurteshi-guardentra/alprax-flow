import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@lovable.dev/mcp-js';
import { supabaseForUser } from '@/lib/mcp/supabase';

const createClient = vi.hoisted(() => vi.fn(() => ({ scoped: true })));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

function context(authenticated: boolean, token?: string) {
  return {
    isAuthenticated: () => authenticated,
    getToken: () => token,
    getUserId: () => authenticated ? 'test-user' : undefined,
  } as unknown as ToolContext;
}

afterEach(() => vi.unstubAllEnvs());

describe('MCP caller access', () => {
  it('refuses anonymous calls rather than falling back to public access', () => {
    expect(() => supabaseForUser(context(false))).toThrow('A verified OAuth user is required');
    expect(createClient).not.toHaveBeenCalled();
  });
  it('refuses missing caller tokens', () => {
    expect(() => supabaseForUser(context(true))).toThrow('A verified OAuth user is required');
    expect(createClient).not.toHaveBeenCalled();
  });
  it('uses the runtime publishable-key dictionary and verified caller bearer', () => {
    vi.stubEnv('SUPABASE_URL', 'https://app.invalid');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEYS', JSON.stringify({ default: 'sb_publishable_test' }));
    supabaseForUser(context(true, 'synthetic-test-token'));
    expect(createClient).toHaveBeenCalledWith('https://app.invalid', 'sb_publishable_test', {
      global: { headers: { Authorization: 'Bearer synthetic-test-token' } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });
});