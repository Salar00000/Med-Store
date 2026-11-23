import Product from '../models/Product.js';

const SORTS = {
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  default: { name: 1 },
};

const DEFAULT_PAGE_SIZE = 12;

export async function listProducts(req, res, next) {
  try {
    const { category, search, sort, page = 1, limit = DEFAULT_PAGE_SIZE } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') filter.category = category;

    if (search) {
      // Use a safe regex escape to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ name: re }, { desc: re }, { category: re }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(SORTS[sort] || SORTS.default).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}
