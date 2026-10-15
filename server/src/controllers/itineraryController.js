import { GeminiAIService } from '../services/ai/gemini.js';

export class ItineraryController {
  static async generate(req, res, next) {
    try {
      const {
        origin,
        destination,
        startDate,
        endDate,
        durationDays,
        travelers,
        totalBudget,
        currency = 'INR',
        preferences,
        outboundTransport,
        returnTransport,
        accommodation,
      } = req.body;

      if (!origin || !destination || !startDate || !endDate) {
        res.status(400).json({ error: 'Origin, destination, startDate, and endDate are required.' });
        return;
      }

      const itinerary = await GeminiAIService.generateItinerary({
        origin,
        destination,
        startDate,
        endDate,
        durationDays: durationDays || 7,
        travelers: travelers || 1,
        totalBudget: totalBudget || 15000,
        currency,
        preferences: preferences || {
          travelStyle: 'budget',
          transportStrategy: 'balanced',
          interests: ['sightseeing', 'beaches'],
          accommodationType: 'budget_hotel',
        },
        outboundTransport,
        returnTransport,
        accommodation,
      });

      res.status(200).json(itinerary);
    } catch (err) {
      next(err);
    }
  }
}
