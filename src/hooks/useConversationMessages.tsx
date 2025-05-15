
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/message';

export function useConversationMessages(conversationId?: string | null) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get messages for a specific conversation
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .eq('swap_request_id', conversationId)
        .order('sent_at', { ascending: true });
        
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user && !!conversationId
  });
  
  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId || !user) return;
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `swap_request_id=eq.${conversationId}`
        },
        (payload) => {
          // Update the messages query data with the new message
          queryClient.setQueryData(['messages', conversationId], (oldData: Message[] = []) => {
            // Check if the message is already in the array to avoid duplicates
            if (oldData.some(msg => msg.id === payload.new.id)) {
              return oldData;
            }
            
            // Add the new message to the array
            return [...oldData, payload.new as Message];
          });
          
          // Update conversations list to show latest message
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, swapRequestId }: { content: string, swapRequestId: string }) => {
      if (!user) throw new Error('You must be logged in to send a message');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          swap_request_id: swapRequestId,
          sender_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
