import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileWithDetails, Review } from '@/types/supabase';

export interface ProfileData {
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  email?: string | null;
}

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updateProfile: updateAuthProfile } = useAuth();

  // Get profile by username or ID with improved error handling
  const getProfile = async (usernameOrId: string) => {
    if (!usernameOrId) {
      throw new Error('Username or ID is required');
    }
    
    // Check if we're searching by ID or username
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usernameOrId);
    
    try {
      const query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      const { data, error } = await (isUuid 
        ? query.eq('id', usernameOrId).maybeSingle()
        : query.eq('username', usernameOrId).maybeSingle());
      
      if (error) throw error;
      if (!data) throw new Error(`Profile not found for ${usernameOrId}`);
      
      return data as ProfileWithDetails;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      throw new Error(error.message || 'Failed to load profile');
    }
  };

  // Get current user's profile with better error handling
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          // If profile doesn't exist, create it
          const newProfile = {
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            avatar_url: user.user_metadata?.avatar_url || null,
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          return createdProfile as ProfileWithDetails;
        }
        
        return data as ProfileWithDetails;
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message || 'Failed to load user profile');
      }
    },
    retry: 2,
    enabled: !!user
  });

  // Get reviews for a user
  const getReviews = async (userId: string): Promise<Review[]> => {
    try {
      // Use RPC call instead of direct table access
      const { data, error } = await supabase.rpc('get_user_reviews', { p_user_id: userId });
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      throw new Error(error.message || 'Failed to load reviews');
    }
  };

  // Update profile mutation with better error handling
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileData) => {
      if (!user) throw new Error('You must be logged in to update your profile');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Also update the profile in the auth context
      await updateAuthProfile(profileData);
      
      return data as ProfileWithDetails;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update profile: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async ({ userId, rating, comment }: { userId: string, rating: number, comment?: string }) => {
      if (!user) throw new Error('You must be logged in to leave a review');
      
      // Use RPC call to create a review
      const { data, error } = await supabase.rpc('create_review', {
        p_user_id: userId,
        p_reviewer_id: user.id,
        p_rating: rating,
        p_comment: comment || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.userId] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit review: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('You must be logged in to update your avatar');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload image
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl.publicUrl
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Also update auth context
      await updateAuthProfile({ avatar_url: publicUrl.publicUrl });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update avatar: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    profile,
    profileError,
    isLoadingProfile,
    getProfile,
    getReviews,
    updateProfile: updateProfileMutation.mutate,
    createReview: createReviewMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: updateAvatarMutation.isPending
  };
}
