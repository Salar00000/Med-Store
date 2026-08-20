import { Router } from 'express';
import { createOrder, listMyOrders } from '../controllers/orders.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth, createOrder);
router.get('/', auth, listMyOrders);

export default router;
