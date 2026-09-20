import { Router } from 'express';
import * as tables from '../controllers/tableController.js';

const router = Router();

router.get('/', tables.getAll);
router.put('/:id', tables.update);

export default router;
