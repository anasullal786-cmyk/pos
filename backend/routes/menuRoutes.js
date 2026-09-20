import { Router } from 'express';
import * as menu from '../controllers/menuController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(menu.getAll));
router.post('/', asyncHandler(menu.create));
router.put('/:id', asyncHandler(menu.update));
router.delete('/:id', asyncHandler(menu.remove));

export default router;
