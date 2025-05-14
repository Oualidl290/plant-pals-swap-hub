
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PlantWithDetails, FavoriteStatus } from '@/types/supabase';

export interface PlantFormData {
  name: string;
  species?: string | null;
  description?: string | null;
  image_url?: string | null;
  available_for_swap: boolean;
  difficulty?: string;
  sunlight?: string;
  watering_frequency?: string;
  size?: string;
  care_instructions?: string | null;
  swap_preferences?: string | null;
  location?: string | null;
}

export function usePlants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    difficulty: 'all',
    sunlight: 'all',
    size: 'all',
    onlyAvailable: false,
  });
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Default page size
  const [totalCount, setTotalCount] = useState(0);

  // Get all plants with search, filters and pagination
  const { data: plants, isLoading, error } = useQuery({
    queryKey: ['plants', searchTerm, filterOptions, sortBy, currentPage, pageSize],
    queryFn: async () => {
      // First, get the total count
      let countQuery = supabase.from('plants').select('id', { count: 'exact' });
      
      // Apply search term for count
      if (searchTerm) {
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,species.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply filters for count
      if (filterOptions.difficulty !== 'all') {
        countQuery = countQuery.eq('difficulty', filterOptions.difficulty);
      }
      
      if (filterOptions.sunlight !== 'all') {
        countQuery = countQuery.eq('sunlight', filterOptions.sunlight);
      }
      
      if (filterOptions.size !== 'all') {
        countQuery = countQuery.eq('size', filterOptions.size);
      }
      
      if (filterOptions.onlyAvailable) {
        countQuery = countQuery.eq('available_for_swap', true);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      if (count !== null) {
        setTotalCount(count);
      }
      
      // Now fetch the actual data with pagination
      let query = supabase.from('plants').select(`
        *,
        profiles!inner(username, avatar_url, location)
      `);

      // Apply search term
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,species.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filterOptions.difficulty !== 'all') {
        query = query.eq('difficulty', filterOptions.difficulty);
      }
      
      if (filterOptions.sunlight !== 'all') {
        query = query.eq('sunlight', filterOptions.sunlight);
      }
      
      if (filterOptions.size !== 'all') {
        query = query.eq('size', filterOptions.size);
      }
      
      if (filterOptions.onlyAvailable) {
        query = query.eq('available_for_swap', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as PlantWithDetails[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user's plants
  const { data: userPlants, isLoading: isLoadingUserPlants } = useQuery({
    queryKey: ['user-plants'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlantWithDetails[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  });

  // Get a single plant
  const getPlant = async (id: string) => {
    const { data, error } = await supabase
      .from('plants')
      .select(`
        *,
        owner:profiles!plants_owner_id_fkey(id, username, avatar_url, location, bio)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PlantWithDetails;
  };

  // Create plant mutation
  const createPlantMutation = useMutation({
    mutationFn: async (plantData: PlantFormData) => {
      if (!user) throw new Error('You must be logged in to create a plant');

      const { data, error } = await supabase
        .from('plants')
        .insert({
          ...plantData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['user-plants'] });
      toast({
        title: 'Plant created',
        description: 'Your plant has been successfully added.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create plant: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update plant mutation
  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: PlantFormData }) => {
      const { data: updatedPlant, error } = await supabase
        .from('plants')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedPlant;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['user-plants'] });
      queryClient.invalidateQueries({ queryKey: ['plant', variables.id] });
      toast({
        title: 'Plant updated',
        description: 'Your plant has been successfully updated.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update plant: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Delete plant mutation
  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['user-plants'] });
      toast({
        title: 'Plant deleted',
        description: 'Your plant has been successfully deleted.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete plant: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Toggle favorite mutation using RPC
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (plantId: string) => {
      if (!user) throw new Error('You must be logged in to favorite a plant');

      // Check if already favorited using RPC
      const { data: existingFavorite, error: checkError } = await supabase
        .rpc('get_favorite', { p_user_id: user.id, p_plant_id: plantId });

      if (checkError) throw checkError;

      if (existingFavorite && existingFavorite.length > 0) {
        // Remove favorite using RPC
        const { error } = await supabase
          .rpc('remove_favorite', { p_user_id: user.id, p_plant_id: plantId });

        if (error) throw error;
        return { plantId, favorited: false } as FavoriteStatus;
      } else {
        // Add favorite using RPC
        const { error } = await supabase
          .rpc('add_favorite', { p_user_id: user.id, p_plant_id: plantId });

        if (error) throw error;
        return { plantId, favorited: true } as FavoriteStatus;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: result.favorited ? 'Added to favorites' : 'Removed from favorites',
        description: result.favorited 
          ? 'Plant has been added to your favorites.' 
          : 'Plant has been removed from your favorites.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update favorites: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Check if a plant is favorited
  const checkFavoriteStatus = async (plantId: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .rpc('get_favorite', { p_user_id: user.id, p_plant_id: plantId });
      
    if (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
    
    return data && data.length > 0;
  };

  return {
    plants,
    userPlants,
    isLoading,
    isLoadingUserPlants,
    error,
    searchTerm,
    setSearchTerm,
    filterOptions,
    setFilterOptions,
    sortBy,
    setSortBy,
    getPlant,
    createPlant: createPlantMutation.mutate,
    updatePlant: updatePlantMutation.mutate,
    deletePlant: deletePlantMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    checkFavoriteStatus,
    isCreating: createPlantMutation.isPending,
    isUpdating: updatePlantMutation.isPending,
    isDeleting: deletePlantMutation.isPending,
    // Pagination properties
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize)
  };
}
