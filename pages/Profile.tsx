import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';
import { Camera, User, Package, Clock, ShieldCheck, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [defaultAvatar, setDefaultAvatar] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user && profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setNid(profile.nid_number || '');
      setAvatarUrl(profile.avatar_url);
      fetchDefaultAvatar();
      fetchOrders();
    }
  }, [user, profile]);

  const fetchDefaultAvatar = async () => {
    try {
      const { data } = await supabase.from('site_settings' as any).select('value').eq('key', 'default_avatar').single();
      if ((data as any)?.value?.url) setDefaultAvatar((data as any).value.url);
    } catch (e) { console.error('Error fetching default avatar', e); }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await orderService.getUserOrders(user.id);
      setOrders(data || []);
    } catch (err: any) {
      toast.error('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({
        full_name: fullName,
        phone,
        nid_number: nid
      }).eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
      
      // Force refresh auth context session event or manually reload
      window.location.reload(); 
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      // Update User Record
      const { error: updateError } = await supabase.from('users').update({ avatar_url: newUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      setAvatarUrl(newUrl);
      toast.success('Avatar updated!');
      window.location.reload();
    } catch (err: any) {
      toast.error('Avatar upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user || !profile) return null;

  const displayAvatar = avatarUrl || defaultAvatar;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-card border rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 w-full h-32 bg-primary/10 left-0" />
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-transform hover:scale-105 shadow-md">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </label>
          </div>
          
          <div className="text-center sm:text-left flex-1 pb-2">
            <h1 className="text-3xl font-bold">{profile.full_name || 'Anonymous User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {profile.role} account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b gap-8">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-4 font-medium transition-colors relative ${activeTab === 'info' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Info
          </div>
          {activeTab === 'info' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 font-medium transition-colors relative ${activeTab === 'orders' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Order History
          </div>
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'info' ? (
          <form onSubmit={handleUpdateProfile} className="bg-card border rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Security & Profile Defaults
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" value={user.email} disabled
                  className="w-full px-4 py-2 bg-muted/50 border rounded-lg outline-none cursor-not-allowed opacity-70" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input 
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="+1234..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">NID / ID Number</label>
                <input 
                  type="text" value={nid} onChange={e => setNid(e.target.value)}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="ID Number"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Recent Orders
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card border rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Looks like you haven't made any purchases yet. Start shopping to see your orders here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${Number(order.total_amount).toFixed(2)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                            {item.products?.images?.[0] ? (
                              <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium hover:underline cursor-pointer">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
