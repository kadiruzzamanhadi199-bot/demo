import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, type Product } from '../services/productService';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then(data => {
        setProduct(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
        quantity: 1
      });
      toast.success('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32 bg-card rounded-3xl border mb-12">
        <h2 className="text-2xl font-bold">Product not found</h2>
      </div>
    );
  }

  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000';

  return (
    <div className="bg-card border rounded-3xl p-6 sm:p-10 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted border"
          >
            <img 
              src={image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map(thumb => (
                <div key={thumb} className="aspect-square rounded-xl bg-muted border cursor-pointer hover:border-primary transition-colors overflow-hidden">
                   <img src={thumb} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">{product.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">(124 Reviews)</span>
          </div>

          <div className="text-4xl font-extrabold mb-6">${Number(product.price).toFixed(2)}</div>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="flex items-center gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              In Stock ({product.stock || 0} available)
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto border-t pt-8">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="w-6 h-6" /> Add to Cart
            </button>
            <button className="p-4 border border-border rounded-xl hover:bg-muted text-muted-foreground transition-all hover:scale-[1.02] active:scale-95">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <Truck className="w-5 h-5 text-primary" /> Free Shipping
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <RotateCcw className="w-5 h-5 text-primary" /> 30 Day Return
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <ShieldCheck className="w-5 h-5 text-primary" /> 1 Year Warranty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
