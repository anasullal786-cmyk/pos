import { Router } from 'express';
import * as orders from '../controllers/orderController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(orders.getAll));
router.get('/:id', asyncHandler(orders.getOne));
router.post('/', asyncHandler(orders.create));
router.put('/:id', asyncHandler(orders.update));
router.delete('/:id', asyncHandler(orders.remove));

export default router;
