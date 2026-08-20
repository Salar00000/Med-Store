import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PromoCode from '../models/PromoCode.js';

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

export async function createOrder(req, res, next) {
  try {
    const { items, shippingInfo, promoCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty' });
    }
    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zip) {
      return res.status(400).json({ message: 'Complete shipping information is required' });
    }

    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    if (products.length !== ids.length) {
      return res.status(400).json({ message: 'One or more products are unavailable' });
    }
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const product = byId.get(i.productId);
      const qty = Math.max(1, Number(i.qty) || 1);
      return { productId: product._id, name: product.name, price: product.price, qty, emoji: product.emoji };
    });

    const subtotal = Number(orderItems.reduce((sum, it) => sum + it.price * it.qty, 0).toFixed(2));
    const discount = promoCode ? await applyPromo(promoCode, subtotal) : 0;
    const discountedSub = Number((subtotal - discount).toFixed(2));
    const tax = Number((discountedSub * TAX_RATE).toFixed(2));
    const shipping = discountedSub >= FREE_SHIPPING_THRESHOLD || discountedSub === 0 ? 0 : SHIPPING_FEE;
    const total = Number((discountedSub + tax + shipping).toFixed(2));

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingInfo,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      promoCode: promoCode ? promoCode.toUpperCase() : null,
    });

    res.status(201).json({ order });
  } catch (err) { next(err); }
}

async function applyPromo(code, subtotal) {
  const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true });
  if (!promo) throw Object.assign(new Error('Invalid promo code'), { status: 400 });
  return Number(((subtotal * promo.discountPercent) / 100).toFixed(2));
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
}
