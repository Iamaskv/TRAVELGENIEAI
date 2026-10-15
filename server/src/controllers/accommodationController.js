import { AccommodationService } from '../services/accommodation/accommodationService.js';
import { AccommodationSearchSchema } from '../validators/index.js';

export class AccommodationController {
  static async search(req, res, next) {
    try {
      const validated = AccommodationSearchSchema.parse(req.body);
      const results = await AccommodationService.searchAccommodations({
        destination: validated.destination,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        travelers: validated.travelers,
        accommodationType: validated.accommodationType,
        maxNightlyRate: validated.maxNightlyRate,
        minRating: validated.minRating,
        travelStyle: req.body.travelStyle || 'budget',
      });

      res.status(200).json({
        destination: validated.destination,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        count: results.length,
        accommodations: results,
      });
    } catch (err) {
      next(err);
    }
  }
}
