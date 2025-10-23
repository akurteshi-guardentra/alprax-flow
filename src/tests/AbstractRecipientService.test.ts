import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbstractRecipientService } from '../services/recipient/AbstractRecipientService';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

describe('AbstractRecipientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'sender@example.com' } }
    });
  });

  describe('getRecipients', () => {
    it('should fetch all recipients', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'recipient-1',
              recipient_name: 'John Doe',
              relationship: 'email:john@example.com',
              country: 'US',
              created_at: new Date().toISOString()
            }
          ]
        })
      });

      const recipients = await AbstractRecipientService.getRecipients();

      expect(recipients).toHaveLength(1);
      expect(recipients[0].name).toBe('John Doe');
      expect(recipients[0].identifier).toBe('john@example.com');
    });
  });

  describe('addRecipient', () => {
    it('should add a new recipient', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: [{
          user_id: 'recipient-user-id',
          has_stellar_account: true
        }]
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { public_key: 'MOCK_STELLAR_ADDRESS' }
        }),
        insert: vi.fn().mockReturnThis()
      });

      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { public_key: 'MOCK_STELLAR_ADDRESS' }
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-recipient-id',
              user_id: 'test-user-id',
              recipient_name: 'Jane Doe',
              country: 'US',
              relationship: 'email:jane@example.com',
              created_at: new Date().toISOString()
            }
          })
        })
      });

      const recipient = await AbstractRecipientService.addRecipient(
        'jane@example.com',
        'Jane Doe',
        'US'
      );

      expect(recipient).toBeDefined();
      expect(recipient?.name).toBe('Jane Doe');
      expect(recipient?.identifier).toBe('jane@example.com');
    });
  });
});
