import { TripStore } from '../models/index.js';
import { PlanTripSchema } from '../validators/index.js';
import { TransportService } from '../services/transport/transportService.js';
import { AccommodationService } from '../services/accommodation/accommodationService.js';
import { BudgetEngine } from '../services/budget/budgetEngine.js';
import { GeminiAIService } from '../services/ai/gemini.js';

export class TripController {
  /**
   * End-to-end trip planning endpoint
   */
  static async planTrip(req, res, next) {
    try {
      const validated = PlanTripSchema.parse(req.body);

      const start = new Date(validated.startDate);
      const end = new Date(validated.endDate);
      const diffMs = end.getTime() - start.getTime();
      const durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      const travelers = validated.adults + validated.children;

      // 1. Search Outbound Transport
      const outboundResult = await TransportService.searchTransport({
        origin: validated.origin,
        destination: validated.destination,
        date: validated.startDate,
        travelers,
        direction: 'outbound',
        strategy: validated.preferences.transportStrategy,
        preferredModes: validated.preferences.preferredTransportModes,
      });

      // 2. Search Return Transport independently
      const returnResult = await TransportService.searchTransport({
        origin: validated.destination,
        destination: validated.origin,
        date: validated.endDate,
        travelers,
        direction: 'return',
        strategy: validated.preferences.transportStrategy,
        preferredModes: validated.preferences.preferredTransportModes,
      });

      // 3. Search Accommodations
      const accommodations = await AccommodationService.searchAccommodations({
        destination: validated.destination,
        checkIn: validated.startDate,
        checkOut: validated.endDate,
        travelers,
        accommodationType: validated.preferences.accommodationType,
        travelStyle: validated.preferences.travelStyle,
      });

      // Pick defaults based on strategy
      let selectedOutbound = outboundResult.recommendedBestValue || outboundResult.options[0];
      let selectedReturn = returnResult.recommendedBestValue || returnResult.options[0];

      if (validated.preferences.transportStrategy === 'cheapest') {
        selectedOutbound = outboundResult.recommendedCheapest || selectedOutbound;
        selectedReturn = returnResult.recommendedCheapest || selectedReturn;
      } else if (validated.preferences.transportStrategy === 'fastest') {
        selectedOutbound = outboundResult.recommendedFastest || selectedOutbound;
        selectedReturn = returnResult.recommendedFastest || selectedReturn;
      }

      const selectedAccommodation = accommodations[0];

      // 4. Calculate Deterministic Budget Breakdown
      const budgetBreakdown = BudgetEngine.calculateBreakdown({
        totalBudget: validated.totalBudget,
        currency: validated.currency,
        durationDays,
        travelers,
        travelStyle: validated.preferences.travelStyle,
        outboundFare: selectedOutbound ? selectedOutbound.totalFare : 0,
        returnFare: selectedReturn ? selectedReturn.totalFare : 0,
        accommodationTotal: selectedAccommodation ? selectedAccommodation.totalPrice : 0,
        reservePercentage: validated.preferences.reservePercentage ?? 10,
        destination: validated.destination,
      });

      // 5. Generate Combinations Alternatives
      const combinations = BudgetEngine.optimizeCombinations(
        outboundResult.options,
        returnResult.options,
        accommodations,
        {
          totalBudget: validated.totalBudget,
          currency: validated.currency,
          durationDays,
          travelers,
          travelStyle: validated.preferences.travelStyle,
          reservePercentage: validated.preferences.reservePercentage ?? 10,
          destination: validated.destination,
        }
      );

      // 6. Generate AI Itinerary
      const itinerary = await GeminiAIService.generateItinerary({
        origin: validated.origin,
        destination: validated.destination,
        startDate: validated.startDate,
        endDate: validated.endDate,
        durationDays,
        travelers,
        totalBudget: validated.totalBudget,
        currency: validated.currency,
        preferences: validated.preferences,
        outboundTransport: selectedOutbound,
        returnTransport: selectedReturn,
        accommodation: selectedAccommodation,
      });

      // 7. Compile complete plan
      const plan = {
        origin: validated.origin,
        destination: validated.destination,
        startDate: validated.startDate,
        endDate: validated.endDate,
        durationDays,
        travelers,
        adults: validated.adults,
        children: validated.children,
        isRoundTrip: validated.isRoundTrip,
        totalBudget: validated.totalBudget,
        currency: validated.currency,
        preferences: validated.preferences,
        selectedOutbound,
        selectedReturn,
        selectedAccommodation,
        itinerary,
        budgetBreakdown,
        outboundOptions: outboundResult.options,
        returnOptions: returnResult.options,
        accommodationOptions: accommodations,
        combinations,
        status: 'draft',
      };

      res.status(200).json(plan);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Save a trip to the user's account
   */
  static async saveTrip(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'You must be logged in to save a trip.' });
        return;
      }

      const tripData = {
        ...req.body,
        userId: req.user.id,
        status: 'saved',
      };

      const saved = await TripStore.create(tripData);
      res.status(201).json({
        message: 'Trip saved successfully',
        trip: saved,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List all trips for current authenticated user
   */
  static async getTrips(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const trips = await TripStore.findByUser(req.user.id);
      res.status(200).json({ trips });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get a single trip by ID (with ownership verification)
   */
  static async getTripById(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tripId = req.params.id;
      const trip = await TripStore.findById(tripId);

      if (!trip) {
        res.status(404).json({ error: 'Trip not found.' });
        return;
      }

      // Check ownership
      if (trip.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied. You do not own this trip.' });
        return;
      }

      res.status(200).json({ trip });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update a trip (e.g. swapping options, recalculating budget)
   */
  static async updateTrip(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tripId = req.params.id;
      const existing = await TripStore.findById(tripId);

      if (!existing) {
        res.status(404).json({ error: 'Trip not found.' });
        return;
      }

      if (existing.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied. You do not own this trip.' });
        return;
      }

      const updated = await TripStore.update(tripId, req.body);
      res.status(200).json({
        message: 'Trip updated successfully',
        trip: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a trip
   */
  static async deleteTrip(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tripId = req.params.id;
      const existing = await TripStore.findById(tripId);

      if (!existing) {
        res.status(404).json({ error: 'Trip not found.' });
        return;
      }

      if (existing.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied. You do not own this trip.' });
        return;
      }

      await TripStore.delete(tripId);
      res.status(200).json({ message: 'Trip deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
}
