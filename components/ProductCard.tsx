import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';

import type { Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
  const rating = 4.8;
  const reviews = 124;
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-foreground">
            {product.category}
          </span>
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">${Number(product.price).toFixed(2)}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary rounded-full p-2.5 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
