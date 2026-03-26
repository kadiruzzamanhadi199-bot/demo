import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export const chatService = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .contains('participant_ids', [userId])
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(full_name, avatar_url, role_id)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update conversation updated_at
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    
    return data;
  },

  async createConversation(participantIds: string[]) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant_ids: participantIds })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, callback)
      .subscribe();
  }
};
