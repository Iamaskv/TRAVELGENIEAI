import { Router } from 'express';
import { ItineraryController } from '../controllers/itineraryController.js';

const router = Router();

router.post('/generate', ItineraryController.generate);

export default router;
