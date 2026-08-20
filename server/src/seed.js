import Product from './models/Product.js';
import PromoCode from './models/PromoCode.js';

const products = [
  { id: 1, name: 'Advanced Pain Relief', price: 12.99, originalPrice: 16.99, category: 'Medicine', emoji: '\u{1F48A}', desc: 'Fast-acting formula for severe pain relief. Pharmaceutical-grade ingredients.', rating: 4.8, reviews: 234 },
  { id: 2, name: 'Immunity Vitamin C', price: 18.5, originalPrice: 24.0, category: 'Vitamins', emoji: '\u{1F34A}', desc: 'High potency 1000mg immune support. Buffered for sensitive stomachs.', rating: 4.9, reviews: 412 },
  { id: 3, name: 'Digital Thermometer', price: 24.99, originalPrice: 29.99, category: 'Devices', emoji: '\u{1F321}\u{FE0F}', desc: 'Clinical accuracy in 3 seconds. Fever alert & memory recall.', rating: 4.7, reviews: 187 },
  { id: 4, name: 'N95 Medical Masks', price: 14.99, originalPrice: 19.99, category: 'Protection', emoji: '\u{1F637}', desc: 'Pack of 20, fluid resistant. 95% filtration efficiency, FDA cleared.', rating: 4.6, reviews: 528 },
  { id: 5, name: 'First Aid Kit Pro', price: 45.0, originalPrice: 59.99, category: 'Essentials', emoji: '\u{26D1}\u{FE0F}', desc: 'Complete 150-piece set for emergencies. Compact & waterproof case.', rating: 4.9, reviews: 301 },
  { id: 6, name: 'Herbal Cough Syrup', price: 9.99, originalPrice: 12.99, category: 'Medicine', emoji: '\u{1F33F}', desc: '100% natural herbal formula for dry & productive cough relief.', rating: 4.5, reviews: 156 },
  { id: 7, name: 'Hand Sanitizer Gel', price: 5.99, originalPrice: 8.99, category: 'Essentials', emoji: '\u{1F9F4}', desc: 'Kills 99.99% of germs. Moisturizing formula, non-sticky feel.', rating: 4.4, reviews: 892 },
  { id: 8, name: 'Blood Pressure Monitor', price: 59.99, originalPrice: 79.99, category: 'Devices', emoji: '\u{1F493}', desc: 'Clinically validated for home use. Bluetooth sync with health apps.', rating: 4.8, reviews: 445 },
];

export async function seedProducts() {
  await Product.deleteMany({});
  await Product.insertMany(
    products.map(({ id, ...rest }) => ({ ...rest, legacyId: id }))
  );
  return products.length;
}

export async function seedPromoCodes() {
  await PromoCode.deleteMany({});
  await PromoCode.create({ code: 'MEDICARE10', discountPercent: 10 });
  return 1;
}

// CLI entry: `npm run seed --workspace server`
if (process.argv[1].endsWith('seed.js')) {
  import('./config/db.js')
    .then(({ connectDB }) => connectDB())
    .then(async () => {
      const count = await seedProducts();
      const promoCount = await seedPromoCodes();
      console.log(`[seed] inserted ${count} products and ${promoCount} promo code`);
      process.exit(0);
    })
    .catch((err) => { console.error(err); process.exit(1); });
}
