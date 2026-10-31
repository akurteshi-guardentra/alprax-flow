import { describe, expect, it } from 'vitest';
import { getNextParam, isSafeNext, withNext } from '@/lib/next-redirect';

describe('OAuth consent return paths', () => {
  it('preserves consent query parameters and fragment through login and signup', () => {
    const path = '/.lovable/oauth/consent?authorization_id=request-123#approve';
    expect(getNextParam(withNext('/login', path).split('?').slice(1).join('?'))).toBe(path);
    expect(getNextParam(withNext('/signup', path).split('?').slice(1).join('?'))).toBe(path);
  });
  it.each(['//outside.invalid', '/\\outside.invalid', '/\noutside.invalid', 'https://outside.invalid', '/safe\u007f'])('rejects unsafe return %j', path => {
    expect(isSafeNext(path)).toBe(false);
    expect(getNextParam(`?next=${encodeURIComponent(path)}`)).toBeNull();
  });
  it('returns the canonical local path rather than the raw input', () => {
    expect(getNextParam('?next=' + encodeURIComponent('/a/../.lovable/oauth/consent?authorization_id=x#ok'))).toBe('/.lovable/oauth/consent?authorization_id=x#ok');
  });
});