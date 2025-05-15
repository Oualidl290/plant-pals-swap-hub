
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from './useConversations';
import { useConversationMessages } from './useConversationMessages';

export type { Message, Conversation } from '@/types/message';

export function useMessages(activeConversationId?: string | null) {
  const [searchParams] = useSearchParams();
  
  // Extract swap request ID from URL if provided
  const swapIdFromUrl = searchParams.get('swap');
  
  // Effect to handle URL swap parameter
  useEffect(() => {
    if (swapIdFromUrl) {
      console.log("Swap ID from URL:", swapIdFromUrl);
    }
  }, [swapIdFromUrl]);

  const { conversations, isLoadingConversations } = useConversations();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    isSending 
  } = useConversationMessages(activeConversationId);

  return {
    conversations,
    messages,
    isLoading,
    isLoadingConversations,
    sendMessage,
    isSending,
  };
}
