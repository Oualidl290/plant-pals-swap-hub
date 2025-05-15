
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  swap_request_id: string;
  sent_at: string;
  read?: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

export function useMessages(swapRequestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  // Get messages for a specific swap request
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', swapRequestId],
    queryFn: async () => {
      if (!swapRequestId || !user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .eq('swap_request_id', swapRequestId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!swapRequestId && !!user
  });

  // Get all user's conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all swap requests user is involved with
      const { data: swapRequests, error: swapError } = await supabase
        .from('swap_requests')
        .select(`
          id, 
          status,
          created_at,
          updated_at,
          plant_id,
          requester_id,
          plants!inner(*),
          requester:profiles!swap_requests_requester_id_fkey(username, avatar_url),
          owner:plants!inner(owner_id, profiles!plants_owner_id_fkey(username, avatar_url))
        `)
        .or(`requester_id.eq.${user.id},plants.owner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      
      if (swapError) throw swapError;
      
      // For each swap request, get the latest message
      const conversationsWithLastMessage = await Promise.all((swapRequests || []).map(async (swap) => {
        const { data: lastMessage, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(username, avatar_url)
          `)
          .eq('swap_request_id', swap.id)
          .order('sent_at', { ascending: false })
          .limit(1);
        
        if (messageError) console.error('Error fetching message:', messageError);
        
        return {
          ...swap,
          lastMessage: lastMessage && lastMessage.length > 0 ? lastMessage[0] : null,
          otherUser: swap.requester_id === user.id ? swap.owner.profiles : swap.requester
        };
      }));
      
      return conversationsWithLastMessage;
    },
    enabled: !!user
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ swapRequestId, content }: { swapRequestId: string, content: string }) => {
      if (!user) throw new Error('You must be logged in to send messages');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          swap_request_id: swapRequestId,
          content,
          sender_id: user.id,
          sent_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newMessage) => {
      // Only invalidate if not handled by realtime
      if (!newMessages.some(msg => msg.id === newMessage.id)) {
        queryClient.invalidateQueries({ queryKey: ['messages', newMessage.swap_request_id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: swapRequestId ? `swap_request_id=eq.${swapRequestId}` : undefined
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // If it's a new message and not sent by the current user
          if (payload.new && payload.new.sender_id !== user.id) {
            // Get full message data with sender info
            const { data } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(username, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              setNewMessages(prev => [...prev, data]);
              
              // Update queries
              queryClient.invalidateQueries({ queryKey: ['messages', data.swap_request_id] });
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              
              // Notify user
              toast({
                title: 'New message',
                description: `${data.sender?.username || 'Someone'} sent you a message`
              });
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, swapRequestId, queryClient, toast]);

  // Merge realtime messages with query data
  const allMessages = [
    ...(messages || []), 
    ...newMessages.filter(newMsg => 
      !messages?.some(existingMsg => existingMsg.id === newMsg.id)
    )
  ].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

  return {
    messages: allMessages,
    conversations,
    isLoading,
    isLoadingConversations,
    error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending
  };
}
