import { describe, it, expect } from 'vitest';
import { GeminiAIService } from '../src/services/ai/gemini.js';

describe('AI Itinerary Generation & Response Validation', () => {
  it('should generate a valid structured itinerary respecting duration and dates', async () => {
    const itinerary = await GeminiAIService.generateItinerary({
      origin: 'Bhubaneswar',
      destination: 'Goa',
      startDate: '2026-11-01',
      endDate: '2026-11-07',
      durationDays: 7,
      travelers: 1,
      totalBudget: 15000,
      currency: 'INR',
      preferences: {
        travelStyle: 'budget',
        transportStrategy: 'balanced',
        interests: ['Beaches', 'Sightseeing', 'Culture'],
        accommodationType: 'budget_hotel',
      },
    });

    expect(itinerary).toBeDefined();
    expect(itinerary.overview).toBeDefined();
    expect(itinerary.days.length).toBe(7);

    // Verify day numbers and sequence
    itinerary.days.forEach((day, index) => {
      expect(day.dayNumber).toBe(index + 1);
      expect(day.activities.length).toBeGreaterThan(0);
      expect(day.foodRecommendations.length).toBeGreaterThan(0);
    });

    // Verify cultural and packing tips exist
    expect(itinerary.culturalTips.length).toBeGreaterThan(0);
    expect(itinerary.packingSuggestions.length).toBeGreaterThan(0);
  }, 20000);

  it('should generate categorized packing checklist', async () => {
    const packingList = await GeminiAIService.generatePackingList('Goa', 7, 'budget');
    expect(packingList.length).toBeGreaterThan(0);
    const categoryNames = packingList.map((c) => c.category);
    expect(categoryNames.some((c) => c.includes('Documents'))).toBe(true);
    expect(categoryNames.some((c) => c.includes('Electronics'))).toBe(true);
  }, 20000);
});
