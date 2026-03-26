import { Users, LayoutDashboard, Ticket, Package, Tag, Settings } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

export default function AdminDashboard() {
  const location = useLocation();

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 space-y-2">
        <div className="p-4 bg-foreground text-background font-bold rounded-xl mb-4">
          Admin Control
        </div>
        {[
          { name: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
          { name: 'Categories', path: '/admin/categories', icon: <Tag className="w-5 h-5" /> },
          { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
          { name: 'Users', path: '#', icon: <Users className="w-5 h-5" /> },
          { name: 'Coupons', path: '#', icon: <Ticket className="w-5 h-5" /> },
        ].map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-muted text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {item.icon} {item.name}
            </Link>
          );
        })}
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
