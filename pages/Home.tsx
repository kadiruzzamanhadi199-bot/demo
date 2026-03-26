import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Shield, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { productService, type Product } from '../services/productService';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroConfig, setHeroConfig] = useState<any>(null);

  useEffect(() => {
    productService.getProducts().then(data => {
      setProducts(data?.slice(0, 4) || []);
    });

    const fetchHero = async () => {
      try {
        const { data } = await supabase.from('site_settings' as any).select('value').eq('key', 'hero_config').single();
        if ((data as any)?.value) setHeroConfig((data as any).value);
      } catch (err) {
        console.error('Failed to load hero config', err);
      }
    };
    fetchHero();
  }, []);
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border" style={{ backgroundColor: heroConfig?.image_url ? 'transparent' : 'var(--primary-opacity-5)'}}>
        {heroConfig?.image_url ? (
          <div className="absolute inset-0">
            <img src={heroConfig.image_url} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        )}
        
        <div className="relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16 flex flex-col items-center justify-center text-center min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`max-w-3xl ${heroConfig?.image_url ? 'text-white' : ''}`}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
              {heroConfig?.title || 'Discover Premium Products for Your Lifestyle'}
            </h1>
            <p className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto ${heroConfig?.image_url ? 'text-gray-200' : 'text-muted-foreground'}`}>
              {heroConfig?.subtitle || 'Shop the latest trends in electronics, fashion, and home goods with our curated collection of high-quality items.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </Link>
              <Link
                to="/products"
                className={`border shadow-lg px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-muted transition-all hover:scale-105 active:scale-95 ${heroConfig?.image_url ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md' : 'bg-background text-foreground'}`}
              >
                Explore Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { icon: <Shield className="w-8 h-8 text-primary" />, title: 'Secure Checkout', desc: 'Your payments are encrypted and safe.' },
          { icon: <Clock className="w-8 h-8 text-primary" />, title: 'Fast Delivery', desc: 'Get your products delivered in record time.' },
          { icon: <Star className="w-8 h-8 text-primary" />, title: 'Premium Quality', desc: 'We only partner with the best sellers.' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm"
          >
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
          <Link to="/products" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
