import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SellerDashboard from './pages/seller/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOverview from './pages/admin/Overview';
import AdminProducts from './pages/admin/Products';
import Messages from './pages/Messages';
import SellerRequest from './pages/SellerRequest';

// Removed unused placeholder profile component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/seller-request" element={<SellerRequest />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/messages" element={<Messages />} />
          </Route>

          
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
            <Route path="/seller/*" element={<SellerDashboard />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
