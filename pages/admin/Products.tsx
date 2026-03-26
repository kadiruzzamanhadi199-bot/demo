import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { productService, type Product } from '../../services/productService';
import { Plus, Pencil, Trash2, X, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      toast.error('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setTags('');
    setImageUrls([]);
    setEditingProduct(null);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategory(product.category || '');
      setStock(product.stock?.toString() || '0');
      // Fix tags type issue by asserting any array
      setTags((product as any).tags?.join(', ') || '');
      setImageUrls(product.images || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newUrls = [...imageUrls];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const url = await productService.uploadProductImage(file);
        newUrls.push(url);
      }
      setImageUrls(newUrls);
      toast.success('Images uploaded');
    } catch (err: any) {
      toast.error('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const processedTags = tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
      
      const payload: any = {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        images: imageUrls,
        tags: processedTags
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        toast.success('Product updated!');
      } else {
        // Find admin session
        const { data: { session } } = await supabase.auth.getSession();
        payload.seller_id = session?.user?.id;
        if (!payload.seller_id) throw new Error('Not logged in');
        
        await productService.createProduct(payload);
        toast.success('Product created!');
      }
      
      closeModal();
      loadProducts();
    } catch (err: any) {
      toast.error('Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err: any) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground text-sm">Create, edit, and orchestrate all products on the platform.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Pencil className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">You haven't added any products yet. Get started by adding your first product to the store.</p>
            <button 
              onClick={() => openModal()}
              className="bg-secondary text-secondary-foreground font-medium px-4 py-2 rounded-lg"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-muted-foreground">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate w-48">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary px-2.5 py-1 rounded-md text-xs font-medium">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (product.stock || 0) > 10 ? 'bg-green-100 text-green-700' : 
                        (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {(product.stock || 0) > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b p-4 flex items-center justify-between bg-muted/30">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Product Name *</label>
                    <input 
                      required type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter product title..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Product details and description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price ($) *</label>
                    <input 
                      required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <input 
                      required type="text" value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. Electronics, Fashion"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Quantity</label>
                    <input 
                      type="number" value={stock} onChange={e => setStock(e.target.value)}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <input 
                      type="text" value={tags} onChange={e => setTags(e.target.value)}
                      className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="tech, wireless, premium"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <label className="text-sm font-medium">Product Images</label>
                  
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                          <img src={url} alt="upload" className="w-full h-full object-cover" />
                          <button 
                            type="button" onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 hover:bg-muted/50 transition-colors">
                    <input 
                      type="file" multiple accept="image/*" className="hidden" 
                      onChange={handleImageUpload} disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Click to upload images</span>
                      </>
                    )}
                  </label>
                </div>
              </form>
            </div>
            
            <div className="border-t p-4 bg-muted/20 flex justify-end gap-3">
              <button 
                type="button" onClick={closeModal} disabled={submitting}
                className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" form="productForm" disabled={submitting || uploading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
