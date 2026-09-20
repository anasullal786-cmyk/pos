import { Router } from 'express';
import * as menu from '../controllers/menuController.js';

const router = Router();

router.get('/', menu.getAll);
router.post('/', menu.create);
router.put('/:id', menu.update);
router.delete('/:id', menu.remove);

export default router;
