import { GeminiAIService } from '../services/ai/gemini.js';
import { ChatMessageSchema } from '../validators/index.js';

export class AIController {
  static async chat(req, res, next) {
    try {
      const validated = ChatMessageSchema.parse(req.body);
      const responseMessage = await GeminiAIService.chatWithAssistant(
        validated.message,
        validated.tripContext
      );

      res.status(200).json(responseMessage);
    } catch (err) {
      next(err);
    }
  }

  static async getPackingList(req, res, next) {
    try {
      const destination = req.query.destination || req.body.destination || 'Goa';
      const durationDays = parseInt(req.query.durationDays || req.body.durationDays || '7', 10);
      const travelStyle = req.query.travelStyle || req.body.travelStyle || 'budget';

      const packingList = await GeminiAIService.generatePackingList(destination, durationDays, travelStyle);
      res.status(200).json({ packingList });
    } catch (err) {
      next(err);
    }
  }
}
