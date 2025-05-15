
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

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

export interface Conversation {
  id: string;
  plants: any;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  otherUser: {
    username: string | null;
    avatar_url: string | null;
  };
  lastMessage?: Message;
}

export function useMessages(activeConversationId?: string | null) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // Extract swap request ID from URL if provided
  const swapIdFromUrl = searchParams.get('swap');
  
  // Effect to set the active conversation from URL parameter
  useEffect(() => {
    if (swapIdFromUrl && typeof onConversationSelect === 'function') {
      onConversationSelect(swapIdFromUrl);
    }
  }, [swapIdFromUrl]);

  // Get all conversations
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
            username: req.plants?.profiles?.username,
            avatar_url: req.plants?.profiles?.avatar_url
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
          conversation.lastMessage = messages[0] as Message;
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

  // Get messages for a specific conversation
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: async () => {
      if (!user || !activeConversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .eq('swap_request_id', activeConversationId)
        .order('sent_at', { ascending: true });
        
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user && !!activeConversationId
  });
  
  // Set up real-time subscription for messages
  useEffect(() => {
    if (!activeConversationId || !user) return;
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `swap_request_id=eq.${activeConversationId}`
        },
        (payload) => {
          // Update the messages query data with the new message
          queryClient.setQueryData(['messages', activeConversationId], (oldData: Message[] = []) => {
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
  }, [activeConversationId, user, queryClient]);

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
    conversations,
    messages,
    isLoading,
    isLoadingConversations,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
