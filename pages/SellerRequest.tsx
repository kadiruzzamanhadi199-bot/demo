import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Upload, Building2, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function SellerRequest() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const details = JSON.stringify({ fullName, phone, nid });
      
      const { error } = await supabase.from('seller_requests').insert({
        user_id: user.id,
        business_name: businessName,
        business_details: details,
        status: 'pending'
      });

      if (error) throw error;

      // Trigger admin notification edge function quietly
      supabase.functions.invoke('notify-admin', {
        body: { type: 'seller_request', businessName, userId: user.id }
      }).catch(console.error);

      alert('Application submitted successfully! We will review it shortly.');
      navigate('/');
    } catch (err: any) {
      alert('Failed to submit application: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Become a Seller</h1>
        <p className="text-xl text-muted-foreground">Join our platform and reach millions of customers globally.</p>
      </div>

      {!user ? (
        <div className="bg-card border p-8 text-center rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">You must be logged into your account to submit a seller application.</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium">Log In</Link>
            <Link to="/signup" className="bg-muted text-foreground px-6 py-3 rounded-full font-medium">Create Account</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-3xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name</label>
            <input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="Acme Store" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="+1234567890" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">NID / ID Number</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input required type="text" value={nid} onChange={e => setNid(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="Enter ID number" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Identity Documents (NID / Passport Image)</label>
          <div className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="font-medium text-lg mb-1">Click to upload or drag & drop</p>
            <p className="text-sm text-muted-foreground">PNG, JPG or PDF (max. 10MB)</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Application'}
        </button>
        
        <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-green-500" /> Your information is securely encrypted
        </p>
      </form>
      )}
    </div>
  );
}
