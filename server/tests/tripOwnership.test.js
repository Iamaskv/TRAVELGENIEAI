import { describe, it, expect } from 'vitest';
import { TripStore } from '../src/models/index.js';

describe('Trip Ownership & Access Isolation', () => {
  it('should isolate trips so User A cannot see or access User B trips', async () => {
    const userA_Id = 'user_alpha_123';
    const userB_Id = 'user_beta_456';

    // Create trip for User A
    const tripA = await TripStore.create({
      userId: userA_Id,
      origin: 'Bhubaneswar',
      destination: 'Goa',
      startDate: '2026-11-01',
      endDate: '2026-11-07',
      durationDays: 7,
      travelers: 1,
      totalBudget: 15000,
      currency: 'INR',
      status: 'saved',
    });

    // Create trip for User B
    const tripB = await TripStore.create({
      userId: userB_Id,
      origin: 'Delhi',
      destination: 'Manali',
      startDate: '2026-12-10',
      endDate: '2026-12-15',
      durationDays: 5,
      travelers: 2,
      totalBudget: 25000,
      currency: 'INR',
      status: 'saved',
    });

    // Fetch User A trips
    const userATrips = await TripStore.findByUser(userA_Id);
    expect(userATrips.some((t) => t.id === tripA.id)).toBe(true);
    expect(userATrips.some((t) => t.id === tripB.id)).toBe(false);

    // Fetch User B trips
    const userBTrips = await TripStore.findByUser(userB_Id);
    expect(userBTrips.some((t) => t.id === tripB.id)).toBe(true);
    expect(userBTrips.some((t) => t.id === tripA.id)).toBe(false);
  });
});
