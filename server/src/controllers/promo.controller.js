import PromoCode from '../models/PromoCode.js';

export async function validatePromo(req, res, next) {
  try {
    const promo = await PromoCode.findOne({ code: req.params.code.toUpperCase(), active: true });
    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });
    res.json({ valid: true, discountPercent: promo.discountPercent });
  } catch (err) { next(err); }
}
