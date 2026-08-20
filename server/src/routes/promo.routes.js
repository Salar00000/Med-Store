import { Router } from 'express';
import { validatePromo } from '../controllers/promo.controller.js';

const router = Router();
router.get('/:code', validatePromo);
export default router;
