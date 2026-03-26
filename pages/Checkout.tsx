import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, type OrderInsert } from '../services/orderService';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { items, total: subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to complete checkout');
      return;
    }
    setLoading(true);
    
    try {
      const order: OrderInsert = {
        user_id: user.id,
        total_amount: total,
        status: 'processing',
        shipping_address: { fullName, street, city, zip },
      };
      
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      await orderService.createOrder(order, orderItems);
      clearCart();
      setStep(3); // Success
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    }
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Thank you for your purchase. Your order #ORD-84920 is being processed.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <input required value={fullName} onChange={e => setFullName(e.target.value)} type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                <input required value={street} onChange={e => setStreet(e.target.value)} type="text" placeholder="Street Address" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                <div className="grid grid-cols-2 gap-4">
                  <input required value={city} onChange={e => setCity(e.target.value)} type="text" placeholder="City" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                  <input required value={zip} onChange={e => setZip(e.target.value)} type="text" placeholder="ZIP Code" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Details
              </h2>
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground mb-4">
                Stripe / SSLCommerz Integration Placeholder
              </div>
              <div className="space-y-4">
                <input required type="text" placeholder="Card Number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="MM/YY" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                  <input required type="text" placeholder="CVC" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1 mt-4">
              <ShieldCheck className="w-4 h-4" /> Payments are secure and encrypted.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-muted/30 p-6 rounded-2xl h-fit border">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-card border overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground mt-4 pt-4 border-t">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
