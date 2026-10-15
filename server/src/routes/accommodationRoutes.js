import { Router } from 'express';
import { AccommodationController } from '../controllers/accommodationController.js';

const router = Router();

router.post('/search', AccommodationController.search);

export default router;
