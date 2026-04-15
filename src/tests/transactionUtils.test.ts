import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { groupTransactionsByDate } from '../utils/transaction-utils';

// We freeze time to make "today / yesterday / this week" assertions deterministic.
// Frozen: Monday 2024-04-15 12:00:00 UTC
const FROZEN_NOW = new Date('2024-04-15T12:00:00.000Z');

function ts(date: Date) {
  return date.toISOString();
}

describe('groupTransactionsByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty array for null input', () => {
    expect(groupTransactionsByDate(null as any)).toEqual([]);
  });

  it('returns an empty array for an empty array', () => {
    expect(groupTransactionsByDate([])).toEqual([]);
  });

  it('groups a transaction from today under "Today"', () => {
    const today = new Date('2024-04-15T09:00:00.000Z');
    const txs = [{ id: '1', created_at: ts(today) }];

    const groups = groupTransactionsByDate(txs);
    const todayGroup = groups.find((g) => g.title === 'Today');

    expect(todayGroup).toBeDefined();
    expect(todayGroup?.data).toHaveLength(1);
  });

  it('groups a transaction from yesterday under "Yesterday"', () => {
    const yesterday = new Date('2024-04-14T10:00:00.000Z');
    const txs = [{ id: '2', created_at: ts(yesterday) }];

    const groups = groupTransactionsByDate(txs);
    const yesterdayGroup = groups.find((g) => g.title === 'Yesterday');

    expect(yesterdayGroup).toBeDefined();
    expect(yesterdayGroup?.data).toHaveLength(1);
  });

  it('groups a transaction from this week (but not today/yesterday) under "This Week"', () => {
    // Frozen: Monday Apr 15. The week (Mon start) covers Apr 15–21.
    // Apr 16 (Tuesday) is in the same week but not today or yesterday.
    const thisWeek = new Date('2024-04-16T10:00:00.000Z');
    const txs = [{ id: '3', created_at: ts(thisWeek) }];

    const groups = groupTransactionsByDate(txs);
    const weekGroup = groups.find((g) => g.title === 'This Week');

    expect(weekGroup).toBeDefined();
    expect(weekGroup?.data).toHaveLength(1);
  });

  it('groups a transaction from earlier this month under "This Month"', () => {
    const thisMonth = new Date('2024-04-01T10:00:00.000Z');
    const txs = [{ id: '4', created_at: ts(thisMonth) }];

    const groups = groupTransactionsByDate(txs);
    const monthGroup = groups.find((g) => g.title === 'This Month');

    expect(monthGroup).toBeDefined();
  });

  it('groups a transaction from last month using a "Month Year" label', () => {
    const lastMonth = new Date('2024-03-10T10:00:00.000Z');
    const txs = [{ id: '5', created_at: ts(lastMonth) }];

    const groups = groupTransactionsByDate(txs);
    const marchGroup = groups.find((g) => g.title === 'March 2024');

    expect(marchGroup).toBeDefined();
  });

  it('groups a transaction from a previous year with a year-only label', () => {
    const prevYear = new Date('2023-06-15T10:00:00.000Z');
    const txs = [{ id: '6', created_at: ts(prevYear) }];

    const groups = groupTransactionsByDate(txs);
    const yearGroup = groups.find((g) => g.title === '2023');

    expect(yearGroup).toBeDefined();
  });

  it('places today before yesterday in the result array', () => {
    const todayTx = { id: '1', created_at: ts(new Date('2024-04-15T09:00:00.000Z')) };
    const yesterdayTx = { id: '2', created_at: ts(new Date('2024-04-14T09:00:00.000Z')) };
    const txs = [yesterdayTx, todayTx];

    const groups = groupTransactionsByDate(txs);
    const titles = groups.map((g) => g.title);

    expect(titles.indexOf('Today')).toBeLessThan(titles.indexOf('Yesterday'));
  });

  it('sorts transactions within a group from newest to oldest', () => {
    const earlier = new Date('2024-04-15T08:00:00.000Z');
    const later = new Date('2024-04-15T11:00:00.000Z');
    const txs = [
      { id: 'a', created_at: ts(earlier) },
      { id: 'b', created_at: ts(later) }
    ];

    const groups = groupTransactionsByDate(txs);
    const todayGroup = groups.find((g) => g.title === 'Today');

    expect(todayGroup?.data[0].id).toBe('b'); // newest first
    expect(todayGroup?.data[1].id).toBe('a');
  });

  it('groups multiple transactions into their correct buckets', () => {
    const txs = [
      { id: '1', created_at: ts(new Date('2024-04-15T09:00:00.000Z')) }, // today
      { id: '2', created_at: ts(new Date('2024-04-14T09:00:00.000Z')) }, // yesterday
      { id: '3', created_at: ts(new Date('2024-03-01T09:00:00.000Z')) }  // March 2024
    ];

    const groups = groupTransactionsByDate(txs);
    const titles = groups.map((g) => g.title);

    expect(titles).toContain('Today');
    expect(titles).toContain('Yesterday');
    expect(titles).toContain('March 2024');
    expect(groups).toHaveLength(3);
  });

  it('supports the timestamp field as an alternative to created_at', () => {
    const txs = [{ id: '1', timestamp: ts(new Date('2024-04-15T09:00:00.000Z')) }];

    const groups = groupTransactionsByDate(txs);
    expect(groups.find((g) => g.title === 'Today')).toBeDefined();
  });
});
