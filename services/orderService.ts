import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export const orderService = {
  async createOrder(order: OrderInsert, items: Omit<OrderItemInsert, 'order_id'>[]) {
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    const itemsToInsert = items.map(item => ({
      ...item,
      order_id: newOrder.id
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert as OrderItemInsert[]);
      
    if (itemsError) throw itemsError;
    
    return newOrder;
  },
  
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};
