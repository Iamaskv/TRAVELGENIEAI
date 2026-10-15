import { describe, it, expect } from 'vitest';
import { TransportService } from '../src/services/transport/transportService.js';

describe('Transport Ranking & Badging Engine', () => {
  it('should search and assign distinct Cheapest, Fastest, and Best Overall Value badges', async () => {
    const result = await TransportService.searchTransport({
      origin: 'Bhubaneswar',
      destination: 'Goa',
      date: '2026-11-01',
      travelers: 1,
      direction: 'outbound',
      strategy: 'balanced',
    });

    expect(result.options.length).toBeGreaterThan(0);
    expect(result.recommendedCheapest).toBeDefined();
    expect(result.recommendedFastest).toBeDefined();
    expect(result.recommendedBestValue).toBeDefined();

    // The cheapest option must have the minimum totalFare
    const fares = result.options.map((o) => o.totalFare);
    const minFare = Math.min(...fares);
    expect(result.recommendedCheapest?.totalFare).toBe(minFare);

    // The fastest option must have the minimum durationMinutes
    const durations = result.options.map((o) => o.durationMinutes);
    const minDuration = Math.min(...durations);
    expect(result.recommendedFastest?.durationMinutes).toBe(minDuration);

    // Badged options must contain reasons
    expect(result.recommendedCheapest?.reason).toBeDefined();
    expect(result.recommendedFastest?.reason).toBeDefined();
  });

  it('should handle return transport independently with reversed origin/destination', async () => {
    const returnResult = await TransportService.searchTransport({
      origin: 'Goa',
      destination: 'Bhubaneswar',
      date: '2026-11-08',
      travelers: 2,
      direction: 'return',
      strategy: 'fastest',
    });

    expect(returnResult.options.length).toBeGreaterThan(0);
    expect(returnResult.options[0].direction).toBe('return');
    // For 2 travelers, totalFare must equal farePerPerson * 2
    for (const opt of returnResult.options) {
      expect(opt.totalFare).toBe(opt.farePerPerson * 2);
    }
  });
});
