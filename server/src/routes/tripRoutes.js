import { Router } from 'express';
import { TripController } from '../controllers/tripController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/plan', optionalAuth, TripController.planTrip);
router.post('/', requireAuth, TripController.saveTrip);
router.get('/', requireAuth, TripController.getTrips);
router.get('/:id', requireAuth, TripController.getTripById);
router.put('/:id', requireAuth, TripController.updateTrip);
router.delete('/:id', requireAuth, TripController.deleteTrip);

export default router;
