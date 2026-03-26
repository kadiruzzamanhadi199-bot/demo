import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Metrics {
  totalUsers: number;
  totalSellers: number;
  platformRevenue: number;
  activeOrders: number;
  totalItemsSold: number;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time updates for live metrics
    const subscription = supabase
      .channel('admin-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_requests' }, fetchDashboardData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch metrics via RPC
      const { data: metricsData, error: metricsError } = await (supabase.rpc as any)('get_admin_metrics');
      if (metricsError) throw metricsError;
      setMetrics(metricsData as unknown as Metrics);

      // Fetch pending seller requests
      const { data: reqs } = await supabase
        .from('seller_requests')
        .select('*, users(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setPendingRequests(reqs || []);

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setRecentUsers(users || []);

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await (supabase.rpc as any)('approve_seller', { req_id: id });
      if (error) throw error;
      toast.success('Seller approved!');
      fetchDashboardData();
    } catch (err: any) {
      toast.error('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await (supabase.rpc as any)('reject_seller', { req_id: id });
      if (error) throw error;
      toast.success('Seller request rejected');
      fetchDashboardData();
    } catch (err: any) {
      toast.error('Failed to reject: ' + err.message);
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground flex items-center gap-2">Global statistics and admin actions. <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full animate-pulse"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Live Updates</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { name: 'Total Users', value: metrics?.totalUsers || 0 },
          { name: 'Total Sellers', value: metrics?.totalSellers || 0 },
          { name: 'Total Items Sold', value: metrics?.totalItemsSold || 0 },
          { name: 'Active Orders', value: metrics?.activeOrders || 0 },
          { name: 'Platform Revenue', value: `$${metrics?.platformRevenue || '0.00'}` },
        ].map(stat => (
          <div key={stat.name} className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col justify-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">{stat.name}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-2xl p-6 h-[400px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Pending Seller Requests</h2>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending requests.</p>
            ) : pendingRequests.map(req => (
              <div key={req.id} className="p-4 border rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{req.business_name}</h4>
                    <p className="text-sm">Owner: {req.users?.full_name}</p>
                    <p className="text-xs text-muted-foreground">Contact details stored in JSON</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 flex-shrink-0 py-1 rounded-full font-medium">Pending Review</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(req.id)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90">Approve</button>
                  <button onClick={() => handleReject(req.id)} className="flex-1 bg-destructive/10 text-destructive py-2 rounded-lg text-sm font-medium hover:bg-destructive/20">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 h-[400px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-4 justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="text-xs text-muted-foreground">N/A</div>}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded-md font-medium capitalize">
                  New Join
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
