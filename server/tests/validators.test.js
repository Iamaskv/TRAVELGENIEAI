import { describe, it, expect } from 'vitest';
import { PlanTripSchema } from '../src/validators/index.js';

describe('Validation Engine & Date Checks', () => {
  it('should accept valid trip inputs', () => {
    const validData = {
      origin: 'Bhubaneswar',
      destination: 'Goa',
      startDate: '2026-11-01',
      endDate: '2026-11-08',
      adults: 1,
      children: 0,
      isRoundTrip: true,
      totalBudget: 15000,
      currency: 'INR',
      preferences: {
        travelStyle: 'budget',
        transportStrategy: 'balanced',
        interests: ['Beaches', 'Sightseeing'],
        accommodationType: 'budget_hotel',
      },
    };

    const parsed = PlanTripSchema.parse(validData);
    expect(parsed.origin).toBe('Bhubaneswar');
    expect(parsed.destination).toBe('Goa');
  });

  it('should reject invalid dates where end date is before start date', () => {
    const invalidDates = {
      origin: 'Bhubaneswar',
      destination: 'Goa',
      startDate: '2026-11-10',
      endDate: '2026-11-05', // Before start
      adults: 1,
      children: 0,
      totalBudget: 15000,
      preferences: {
        travelStyle: 'budget',
        transportStrategy: 'balanced',
        interests: ['Beaches'],
        accommodationType: 'budget_hotel',
      },
    };

    expect(() => PlanTripSchema.parse(invalidDates)).toThrowError(/End date must be on or after start date/);
  });

  it('should reject negative budgets or zero adults', () => {
    const invalidBudget = {
      origin: 'Delhi',
      destination: 'Goa',
      startDate: '2026-11-01',
      endDate: '2026-11-05',
      adults: 0, // 0 adults
      totalBudget: -500, // negative budget
      preferences: {
        travelStyle: 'budget',
        transportStrategy: 'balanced',
        interests: ['Beaches'],
        accommodationType: 'hostel',
      },
    };

    expect(() => PlanTripSchema.parse(invalidBudget)).toThrow();
  });
});
