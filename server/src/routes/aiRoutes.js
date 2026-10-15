import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', AIController.chat);
router.get('/packing-list', AIController.getPackingList);
router.post('/packing-list', AIController.getPackingList);

export default router;
