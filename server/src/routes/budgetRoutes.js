import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';

const router = Router();

router.post('/calculate', BudgetController.calculate);
router.post('/optimize', BudgetController.optimize);

export default router;
