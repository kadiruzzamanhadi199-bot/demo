import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await (supabase.from('categories' as any)).select('*').order('name');
      if (error) throw error;
      setCategories((data as unknown as Category[]) || []);
    } catch (err: any) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const { error } = await (supabase.from('categories' as any)).insert([{ name: newName.trim(), slug }]);
      if (error) throw error;
      toast.success('Category added');
      setNewName('');
      setAdding(false);
      fetchCategories();
    } catch (err: any) {
      toast.error('Failed to add category: ' + err.message);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const { error } = await (supabase.from('categories' as any)).update({ name: editName.trim(), slug }).eq('id', id);
      if (error) throw error;
      toast.success('Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await (supabase.from('categories' as any)).delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex-1 space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-muted-foreground">Add, edit, and organize product categories.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {adding && (
          <div className="p-4 border-b bg-muted/30 flex items-center gap-4">
            <input 
              autoFocus type="text" value={newName} onChange={e => setNewName(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Smart Watches"
            />
            <button onClick={handleAdd} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Save"><Check className="w-5 h-5"/></button>
            <button onClick={() => {setAdding(false); setNewName('');}} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Cancel"><X className="w-5 h-5"/></button>
          </div>
        )}

        <div className="divide-y">
          {categories.map(cat => (
            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
              {editingId === cat.id ? (
                <div className="flex items-center gap-4 flex-1">
                  <input 
                    autoFocus type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="flex-1 px-4 py-2 border bg-background rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdate(cat.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Save"><Check className="w-4 h-4"/></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Cancel"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono bg-muted inline-block px-2 py-0.5 rounded-md mt-1">{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && !adding && (
            <div className="p-12 text-center text-muted-foreground tracking-wide">
              No categories exist yet. Click "Add Category" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
