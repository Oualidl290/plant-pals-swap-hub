
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type SwapRequestStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'canceled';

export interface SwapRequest {
  id: string;
  created_at: string;
  plant_id: string;
  requester_id: string;
  status: SwapRequestStatus;
  message: string | null;
  updated_at: string;
}

export function useSwapRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get swap requests made by the user
  const { data: sentRequests, isLoading: isLoadingSent } = useQuery({
    queryKey: ['sent-swap-requests'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          plants!inner(*),
          profiles!inner(username, avatar_url)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Get swap requests received by the user
  const { data: receivedRequests, isLoading: isLoadingReceived } = useQuery({
    queryKey: ['received-swap-requests'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          plants!inner(*),
          requester:profiles!swap_requests_requester_id_fkey(username, avatar_url)
        `)
        .eq('plants.owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create swap request
  const createSwapRequest = useMutation({
    mutationFn: async ({ plantId, message }: { plantId: string, message: string }) => {
      if (!user) throw new Error('You must be logged in to send a swap request');
      
      const { data, error } = await supabase
        .from('swap_requests')
        .insert({
          plant_id: plantId,
          requester_id: user.id,
          message,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-swap-requests'] });
      toast({
        title: 'Request sent',
        description: 'Your swap request has been sent!',
        variant: 'default'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send request: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update swap request status
  const updateSwapRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: SwapRequestStatus }) => {
      const { data, error } = await supabase
        .from('swap_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sent-swap-requests'] });
      queryClient.invalidateQueries({ queryKey: ['received-swap-requests'] });
      
      const statusMessages = {
        accepted: 'Swap request accepted!',
        declined: 'Swap request declined.',
        completed: 'Swap has been marked as completed!',
        canceled: 'Swap request canceled.'
      };
      
      toast({
        title: 'Status updated',
        description: statusMessages[data.status as keyof typeof statusMessages] || 'Request status updated',
        variant: 'default'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update request: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    sentRequests,
    receivedRequests,
    isLoadingSent,
    isLoadingReceived,
    createSwapRequest: createSwapRequest.mutate,
    updateSwapRequest: updateSwapRequest.mutate,
    isCreating: createSwapRequest.isPending,
    isUpdating: updateSwapRequest.isPending
  };
}
