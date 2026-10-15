import { TransportService } from '../services/transport/transportService.js';
import { TransportSearchSchema } from '../validators/index.js';

export class TransportController {
  static async search(req, res, next) {
    try {
      const validated = TransportSearchSchema.parse(req.body);
      const results = await TransportService.searchTransport({
        origin: validated.origin,
        destination: validated.destination,
        date: validated.date,
        travelers: validated.travelers,
        direction: validated.direction,
        strategy: validated.strategy,
        preferredModes: validated.preferredModes,
      });

      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }

  static async searchOutbound(req, res, next) {
    try {
      const validated = TransportSearchSchema.parse({
        ...req.body,
        direction: 'outbound',
      });
      const results = await TransportService.searchTransport(validated);
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }

  static async searchReturn(req, res, next) {
    try {
      // In return direction, swap origin and destination
      const validated = TransportSearchSchema.parse({
        ...req.body,
        direction: 'return',
      });
      const results = await TransportService.searchTransport({
        origin: validated.destination,
        destination: validated.origin,
        date: validated.date,
        travelers: validated.travelers,
        direction: 'return',
        strategy: validated.strategy,
        preferredModes: validated.preferredModes,
      });
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }
}
