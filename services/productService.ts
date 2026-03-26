import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type Category = { id: string; name: string; slug: string; image_url?: string };

export const productService = {
  async getCategories() {
    const { data, error } = await supabase.from('categories' as any).select('*').order('name');
    if (error) throw error;
    return data as unknown as Category[];
  },

  async getProducts(category?: string, maxPrice?: number) {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getProductById(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createProduct(product: ProductInsert) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },
  
  async updateProduct(id: string, updates: Partial<ProductInsert>) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadProductImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data.publicUrl;
  }
};
