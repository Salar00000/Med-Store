import Product from '../models/Product.js';

const SORTS = {
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  default: { name: 1 },
};

export async function listProducts(req, res, next) {
  try {
    const { category, search, sort } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { desc: re }, { category: re }];
    }
    const products = await Product.find(filter).sort(SORTS[sort] || SORTS.default);
    res.json({ products });
  } catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) { next(err); }
}
