import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService, type Product, type Category } from '../services/productService';

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    productService.getProducts(activeCategory, maxPrice).then(data => {
      setProducts(data || []);
      setLoading(false);
    }).catch(console.error);
  }, [activeCategory, maxPrice]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-card border rounded-2xl p-6 sticky top-24">
          <div className="flex items-center gap-2 font-semibold text-lg mb-6">
            <Filter className="w-5 h-5" /> Filters
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    className="text-primary focus:ring-primary"
                    checked={activeCategory === 'All'}
                    onChange={() => setActiveCategory('All')}
                  />
                  <span className="text-sm">All</span>
                </label>
                {categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      className="text-primary focus:ring-primary"
                      checked={activeCategory === category.name}
                      onChange={() => setActiveCategory(category.name)}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">Max Price: ${maxPrice}</h3>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <button className="flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-lg hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Sort by: Recommended
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No products found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
