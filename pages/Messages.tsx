import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, MoreVertical, Search, Phone, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const data = await chatService.getConversations(user.id);
      setConversations(data || []);
      if (data && data.length > 0) {
        setActiveChat(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChat) return;
    
    chatService.getMessages(activeChat.id).then(data => {
      setMessages(data || []);
    });

    const subscription = chatService.subscribeToMessages(activeChat.id, (payload) => {
      if (payload.new) {
         setMessages(prev => {
            // Check if exists to prevent duplicates
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
         });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChat) return;
    
    const content = newMessage;
    setNewMessage(''); 
    
    try {
      const addedMsg = await chatService.sendMessage(activeChat.id, user.id, content);
      // Optimistic upate or rely on realtime
      setMessages(prev => {
         if (prev.find(m => m.id === addedMsg.id)) return prev;
         return [...prev, addedMsg];
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl h-[80vh] flex overflow-hidden shadow-sm max-w-6xl mx-auto">
      {/* Sidebar: Conversations List */}
      <div className="w-80 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet</div>
          ) : (
            conversations.map(chat => (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left p-4 flex items-start gap-3 border-b hover:bg-muted/50 transition-colors ${activeChat?.id === chat.id ? 'bg-muted' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  U
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate">Chat #{chat.id.slice(0, 4)}</h3>
                    <span className="text-xs text-muted-foreground">Recent</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground truncate pr-2">Tap to view messages</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-background">
          <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                C
              </div>
              <div>
                <h3 className="font-bold">Chat #{activeChat.id.slice(0, 4)}</h3>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <button className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
              <button className="hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
              <button className="hover:text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">Say hello!</div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-card border-t">
            <form onSubmit={handleSend} className="flex items-end gap-2 bg-muted/50 p-2 rounded-2xl border">
              <button type="button" className="p-3 text-muted-foreground hover:text-primary transition-colors rounded-xl">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-2 text-sm max-h-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground">
          <Send className="w-16 h-16 mb-4 opacity-20" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
