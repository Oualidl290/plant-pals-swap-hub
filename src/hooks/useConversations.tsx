
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types/message';

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      
      // First get sent swap requests
      const { data: sentRequests, error: sentError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          plants(*),
          profiles!swap_requests_requester_id_fkey(username, avatar_url)
        `)
        .eq('requester_id', user.id);
      
      if (sentError) throw sentError;
      
      // Then get received swap requests
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          plants(*),
          requester:profiles!swap_requests_requester_id_fkey(username, avatar_url)
        `)
        .eq('plants.owner_id', user.id);
      
      if (receivedError) throw receivedError;
      
      // Combine and format the conversations
      const allConversations: Conversation[] = [
        ...(sentRequests?.map(req => ({
          id: req.id,
          plants: req.plants,
          status: req.status,
          message: req.message,
          created_at: req.created_at,
          updated_at: req.updated_at,
          otherUser: {
            // Get owner info from the profiles relation since we can't directly access owner
            username: req.profiles?.username,
            avatar_url: req.profiles?.avatar_url
          }
        })) || []),
        ...(receivedRequests?.map(req => ({
          id: req.id,
          plants: req.plants,
          status: req.status,
          message: req.message,
          created_at: req.created_at,
          updated_at: req.updated_at,
          otherUser: {
            username: req.requester?.username,
            avatar_url: req.requester?.avatar_url
          }
        })) || [])
      ];
      
      // Get last messages for each conversation
      for (const conversation of allConversations) {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(username, avatar_url)
          `)
          .eq('swap_request_id', conversation.id)
          .order('sent_at', { ascending: false })
          .limit(1);
          
        if (!messagesError && messages && messages.length > 0) {
          conversation.lastMessage = messages[0];
        }
      }
      
      // Sort by most recent messages or creation date
      return allConversations.sort((a, b) => {
        const aDate = a.lastMessage ? new Date(a.lastMessage.sent_at) : new Date(a.updated_at);
        const bDate = b.lastMessage ? new Date(b.lastMessage.sent_at) : new Date(b.updated_at);
        return bDate.getTime() - aDate.getTime();
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 // 1 minute
  });

  return {
    conversations,
    isLoadingConversations,
  };
}
