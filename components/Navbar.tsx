import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package, ShieldCheck, Store, MessageCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">MarketHub</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-muted/50 border px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
                3
              </span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/messages" className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </Link>

                {profile?.role === 'admin' && (
                  <Link to="/admin" className="p-2 text-primary hover:text-primary/80 rounded-full hover:bg-primary/10 transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </Link>
                )}
                {profile?.role === 'seller' && (
                  <Link to="/seller" className="p-2 text-orange-500 hover:text-orange-600 rounded-full hover:bg-orange-50 transition-colors">
                    <Package className="h-5 w-5" />
                  </Link>
                )}
                
                <Link to="/profile" className="flex items-center gap-2 ml-2 p-1 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-medium shadow-sm">
                    {profile?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                </Link>
                
                <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-2 hidden sm:block">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/seller-request" className="hidden sm:block text-sm font-medium hover:underline text-muted-foreground mr-2">
                  Become a Seller
                </Link>
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-full transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
