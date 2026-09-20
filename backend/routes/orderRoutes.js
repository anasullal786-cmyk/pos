import { Router } from 'express';
import * as orders from '../controllers/orderController.js';

const router = Router();

router.get('/', orders.getAll);
router.get('/:id', orders.getOne);
router.post('/', orders.create);
router.put('/:id', orders.update);
router.delete('/:id', orders.remove);

export default router;
