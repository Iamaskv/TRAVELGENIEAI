import { BudgetEngine } from '../services/budget/budgetEngine.js';
import { BudgetCalculateSchema } from '../validators/index.js';

export class BudgetController {
  static async calculate(req, res, next) {
    try {
      const validated = BudgetCalculateSchema.parse(req.body);
      const breakdown = BudgetEngine.calculateBreakdown({
        totalBudget: validated.totalBudget,
        currency: validated.currency,
        durationDays: validated.durationDays,
        travelers: validated.travelers,
        travelStyle: validated.travelStyle,
        outboundFare: validated.outboundFare,
        returnFare: validated.returnFare,
        accommodationTotal: validated.accommodationTotal,
        reservePercentage: validated.reservePercentage,
        destination: validated.destination,
        customActivitiesCost: req.body.customActivitiesCost,
      });

      res.status(200).json(breakdown);
    } catch (err) {
      next(err);
    }
  }

  static async optimize(req, res, next) {
    try {
      const {
        outboundOptions,
        returnOptions,
        accommodations,
        totalBudget,
        currency = 'INR',
        durationDays,
        travelers,
        travelStyle = 'budget',
        reservePercentage = 10,
        destination,
      } = req.body;

      if (!outboundOptions || !returnOptions || !accommodations || !totalBudget) {
        res.status(400).json({ error: 'outboundOptions, returnOptions, accommodations, and totalBudget are required.' });
        return;
      }

      const combinations = BudgetEngine.optimizeCombinations(
        outboundOptions,
        returnOptions,
        accommodations,
        {
          totalBudget,
          currency,
          durationDays: durationDays || 7,
          travelers: travelers || 1,
          travelStyle,
          reservePercentage,
          destination,
        }
      );

      res.status(200).json({ combinations });
    } catch (err) {
      next(err);
    }
  }
}
