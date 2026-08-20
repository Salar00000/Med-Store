import Subscriber from '../models/Subscriber.js';

export async function subscribe(req, res, next) {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed' });
    await Subscriber.create({ email });
    res.status(201).json({ subscribed: true });
  } catch (err) { next(err); }
}
