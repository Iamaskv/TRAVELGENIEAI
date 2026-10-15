import { describe, it, expect } from 'vitest';
import { BudgetEngine } from '../src/services/budget/budgetEngine.js';

describe('BudgetEngine Deterministic Calculation & Optimization', () => {
  it('should correctly calculate total costs and remainders within budget', () => {
    const result = BudgetEngine.calculateBreakdown({
      totalBudget: 25000,
      currency: 'INR',
      durationDays: 5,
      travelers: 1,
      travelStyle: 'budget',
      outboundFare: 2000,
      returnFare: 2000,
      accommodationTotal: 4000,
      reservePercentage: 10,
    });

    expect(result.currency).toBe('INR');
    expect(result.totalBudget).toBe(25000);
    expect(result.emergencyReserve).toBe(2500); // 10% of 25000
    expect(result.outboundTransportCost).toBe(2000);
    expect(result.returnTransportCost).toBe(2000);
    expect(result.accommodationCost).toBe(4000);
    expect(result.foodCost).toBe(450 * 5 * 1); // 2250
    expect(result.localTransportCost).toBe(350 * 5); // 1750
    expect(result.activitiesCost).toBe(200 * 5 * 1); // 1000
    expect(result.miscellaneousCost).toBe(300 * 5); // 1500

    expect(result.status).toBe('within_budget');
    expect(result.remainingBudget).toBeGreaterThan(0);
    expect(result.percentageUsed).toBeLessThan(100);
    expect(result.shortfallAmount).toBeUndefined();
  });

  it('should accurately detect over-budget scenarios and generate actionable suggestions', () => {
    // Tight budget: 10,000 with 12,000 flight + hotel costs
    const result = BudgetEngine.calculateBreakdown({
      totalBudget: 10000,
      currency: 'INR',
      durationDays: 7,
      travelers: 1,
      travelStyle: 'comfort',
      outboundFare: 6000,
      returnFare: 6000,
      accommodationTotal: 8000,
      reservePercentage: 10,
    });

    expect(result.status).toBe('exceeds_budget');
    expect(result.shortfallAmount).toBeGreaterThan(0);
    expect(result.remainingBudget).toBeLessThan(0);
    expect(result.optimizationSuggestions).toBeDefined();
    expect(result.optimizationSuggestions?.length).toBeGreaterThan(0);

    // Verify recommendations mention transport and accommodation savings
    const combinedSuggestions = result.optimizationSuggestions?.join(' ') || '';
    expect(combinedSuggestions).toContain('exceeds your budget');
  });

  it('should preserve the user configured emergency reserve', () => {
    const resultZero = BudgetEngine.calculateBreakdown({
      totalBudget: 20000,
      durationDays: 3,
      travelers: 1,
      travelStyle: 'budget',
      outboundFare: 1000,
      returnFare: 1000,
      accommodationTotal: 2000,
      reservePercentage: 0,
    });
    expect(resultZero.emergencyReserve).toBe(0);

    const resultTwenty = BudgetEngine.calculateBreakdown({
      totalBudget: 20000,
      durationDays: 3,
      travelers: 1,
      travelStyle: 'budget',
      outboundFare: 1000,
      returnFare: 1000,
      accommodationTotal: 2000,
      reservePercentage: 20,
    });
    expect(resultTwenty.emergencyReserve).toBe(4000); // 20% of 20000
  });
});
