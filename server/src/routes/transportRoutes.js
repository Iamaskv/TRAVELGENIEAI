import { Router } from 'express';
import { TransportController } from '../controllers/transportController.js';

const router = Router();

router.post('/search', TransportController.search);
router.post('/outbound', TransportController.searchOutbound);
router.post('/return', TransportController.searchReturn);

export default router;
