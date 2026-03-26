import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2, UploadCloud, Save } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  
  const [defaultAvatarUrl, setDefaultAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: heroData } = await supabase.from('site_settings' as any).select('value').eq('key', 'hero_config').single();
      if ((heroData as any)?.value) {
        setHeroTitle((heroData as any).value.title || '');
        setHeroSubtitle((heroData as any).value.subtitle || '');
        setHeroImageUrl((heroData as any).value.image_url || null);
      }

      const { data: avatarData } = await supabase.from('site_settings' as any).select('value').eq('key', 'default_avatar').single();
      if ((avatarData as any)?.value) {
        setDefaultAvatarUrl((avatarData as any).value.url || null);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'avatar') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${type}-${Date.now()}.${fileExt}`;
    
    setLoading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      
      if (type === 'hero') {
        setHeroImageUrl(data.publicUrl);
        await saveSetting('hero_config', { title: heroTitle, subtitle: heroSubtitle, image_url: data.publicUrl });
      } else {
        setDefaultAvatarUrl(data.publicUrl);
        await saveSetting('default_avatar', { url: data.publicUrl });
      }
      
      toast.success(`${type === 'hero' ? 'Hero Image' : 'Default Avatar'} updated successfully!`);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase.from('site_settings' as any).upsert({ key, value });
    if (error) throw error;
  };

  const handleSaveHeroText = async () => {
    setSaving(true);
    try {
      await saveSetting('hero_config', { title: heroTitle, subtitle: heroSubtitle, image_url: heroImageUrl });
      toast.success('Hero text updated successfully');
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !saving) return <div className="flex-1 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage UI defaults and global configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Dynamic Hero Form */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold border-b pb-4">Storefront Hero UI</h2>
          
          <div className="space-y-4">
            <div className="aspect-[21/9] bg-muted rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-colors cursor-pointer">
              {heroImageUrl ? (
                <>
                  <img src={heroImageUrl} className="w-full h-full object-cover" alt="Hero Background"/>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="font-medium">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span>Upload Hero Image</span>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'hero')} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Title</label>
              <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Subtitle</label>
              <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none resize-none" />
            </div>

            <button onClick={handleSaveHeroText} disabled={saving} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 font-medium">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Save Hero Settings
            </button>
          </div>
        </div>

        {/* Global Configuration */}
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">Default Profile Avatar</h2>
            <p className="text-sm text-muted-foreground">This image will be used when users haven't uploaded their own profile picture yet.</p>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-muted border overflow-hidden flex-shrink-0">
                {defaultAvatarUrl ? <img src={defaultAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10" />}
              </div>
              
              <div className="flex-1">
                <label className="inline-block bg-background border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Upload Avatar
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
