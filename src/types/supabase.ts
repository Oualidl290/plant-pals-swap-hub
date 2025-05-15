// Extended types for Supabase tables that include our custom columns

export interface PlantWithDetails {
  id: string;
  name: string;
  species: string | null;
  description: string | null;
  image_url: string | null;
  available_for_swap: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  difficulty?: string;
  sunlight?: string;
  watering_frequency?: string;
  size?: string;
  care_instructions?: string | null;
  swap_preferences?: string | null;
  location?: string | null;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
    location: string | null;
    bio?: string | null;
    rating?: number;
  };
  owner?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    location: string | null;
    bio?: string | null;
    rating?: number;
  };
}

export interface ProfileWithDetails {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  instagram?: string | null;
  twitter?: string | null;
  email?: string | null;
  rating?: number;
  completed_swaps?: number;
}

export interface Review {
  id: string;
  user_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  reviewer?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export interface FavoriteStatus {
  plantId: string;
  favorited: boolean;
}

// For swap requests with requester info
export interface SwapRequestWithDetails {
  id: string;
  created_at: string;
  updated_at: string;
  plant_id: string;
  requester_id: string;
  status: string;
  message: string | null;
  plants?: any;
  profiles?: any;
  requester?: any;
  // The properties below should be optional
  type?: 'sent' | 'received'; 
}
