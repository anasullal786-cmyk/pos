import { Router } from 'express';
import * as tables from '../controllers/tableController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(tables.getAll));
router.put('/:id', asyncHandler(tables.update));

export default router;
