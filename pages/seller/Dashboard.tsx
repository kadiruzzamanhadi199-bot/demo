import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings } from 'lucide-react';

export default function SellerDashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$12,426', icon: <DollarSign className="w-6 h-6 text-green-600" /> },
    { name: 'Total Orders', value: '156', icon: <ShoppingBag className="w-6 h-6 text-blue-600" /> },
    { name: 'Active Products', value: '24', icon: <Package className="w-6 h-6 text-orange-600" /> },
  ];

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 space-y-2">
        <div className="p-4 bg-primary text-primary-foreground font-bold rounded-xl mb-4">
          Seller Portal
        </div>
        {[
          { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, active: true },
          { name: 'Products', icon: <Package className="w-5 h-5" />, active: false },
          { name: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, active: false },
          { name: 'Settings', icon: <Settings className="w-5 h-5" />, active: false },
        ].map(item => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              item.active 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {item.icon} {item.name}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Seller</h1>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <div key={stat.name} className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="p-4 bg-muted rounded-xl">{stat.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(order => (
              <div key={order} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center font-bold">
                    #{order}29
                  </div>
                  <div>
                    <h4 className="font-medium">Premium Wireless Headphones</h4>
                    <p className="text-sm text-muted-foreground">John Doe &bull; 2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$299.99</div>
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block mt-1 font-medium">Pending</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
