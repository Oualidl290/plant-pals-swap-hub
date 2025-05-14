
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlants } from "@/hooks/usePlants";
import { useSwapRequests } from "@/hooks/useSwapRequests";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Heart,
  MessageSquare,
  RefreshCw,
  Edit,
  Trash2,
  Share,
  ArrowLeft,
  MapPin,
  Droplets,
  Sun,
  GanttChart,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { PlantWithDetails } from "@/types/supabase";

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleFavorite, deletePlant, isDeleting } = usePlants();
  const { createSwapRequest, isCreating } = useSwapRequests();
  
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get the plant details
  const { data: plant, isLoading, error } = useQuery({
    queryKey: ['plant', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('plants')
        .select(`
          *,
          owner:profiles!plants_owner_id_fkey(id, username, avatar_url, location)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PlantWithDetails;
    },
    enabled: !!id
  });

  // Check if the user has favorited this plant
  const { data: isFavorited } = useQuery({
    queryKey: ['favorite', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return false;

      // Use RPC function to check favorite status
      const { data, error } = await supabase
        .rpc('get_favorite', { p_user_id: user.id, p_plant_id: id });
        
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!id && !!user
  });

  // Check if the user has already sent a swap request
  const { data: existingSwapRequest } = useQuery({
    queryKey: ['swap-request-check', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('plant_id', id)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!id && !!user
  });

  // Handle swap request submission
  const handleSwapRequest = () => {
    if (!id) return;
    
    createSwapRequest({ plantId: id, message: swapMessage }, {
      onSuccess: () => {
        setShowSwapModal(false);
        setSwapMessage("");
      }
    });
  };

  // Handle plant deletion
  const handleDeletePlant = () => {
    if (!id) return;
    
    deletePlant(id, {
      onSuccess: () => {
        navigate('/dashboard');
      }
    });
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plant?.name || "Plant Swap",
        text: `Check out this ${plant?.name} on PlantPals`,
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Plant link copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-serif font-bold text-plant-dark-green mb-4">Plant Not Found</h2>
          <p className="text-plant-gray mb-6">The plant you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="default" className="bg-plant-dark-green hover:bg-plant-dark-green/90">
            <Link to="/plants">Browse Plants</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === plant.owner_id;

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <Button 
          variant="ghost" 
          className="mb-4 text-plant-gray"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plant Image */}
          <div className="rounded-lg overflow-hidden h-[400px] bg-white border border-plant-mint/30">
            <img 
              src={plant.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop'} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Plant Details */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-serif font-bold text-plant-dark-green">{plant.name}</h1>
                <div className="flex gap-2">
                  {user && !isOwner && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={isFavorited ? "text-red-500" : "text-plant-gray"}
                      onClick={() => toggleFavorite(plant.id)}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500" : ""}`} />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-plant-gray"
                    onClick={handleShare}
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={plant.available_for_swap ? "default" : "outline"} className="bg-plant-mint text-plant-dark-green">
                  {plant.available_for_swap ? "Available for swap" : "Not available for swap"}
                </Badge>
                {plant.species && (
                  <span className="text-sm text-plant-gray">{plant.species}</span>
                )}
              </div>
              
              {plant.description && (
                <p className="text-plant-gray mt-2 text-sm">{plant.description}</p>
              )}
            </div>
            
            {/* Care details */}
            <div className="grid grid-cols-3 gap-3 py-2 border-y border-plant-mint/20">
              <div className="flex flex-col items-center p-3 text-center">
                <Sun className="h-5 w-5 text-plant-sage mb-1" />
                <span className="text-xs text-plant-gray">Sunlight</span>
                <span className="text-sm font-medium mt-1">{plant.sunlight || "Not specified"}</span>
              </div>
              
              <div className="flex flex-col items-center p-3 text-center">
                <Droplets className="h-5 w-5 text-plant-mint mb-1" />
                <span className="text-xs text-plant-gray">Water</span>
                <span className="text-sm font-medium mt-1">{plant.watering_frequency || "Not specified"}</span>
              </div>
              
              <div className="flex flex-col items-center p-3 text-center">
                <GanttChart className="h-5 w-5 text-plant-brown mb-1" />
                <span className="text-xs text-plant-gray">Difficulty</span>
                <span className="text-sm font-medium mt-1">{plant.difficulty || "Not specified"}</span>
              </div>
            </div>
            
            {/* Care instructions */}
            {plant.care_instructions && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-plant-dark-green">Care Instructions</h3>
                <p className="text-sm text-plant-gray">{plant.care_instructions}</p>
              </div>
            )}
            
            {/* Swap preferences */}
            {plant.swap_preferences && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-plant-dark-green">Swap Preferences</h3>
                <p className="text-sm text-plant-gray">{plant.swap_preferences}</p>
              </div>
            )}
            
            {/* Owner info */}
            <div className="flex justify-between items-center pt-4 border-t border-plant-mint/20">
              <Link to={`/profile/${plant.owner?.username || plant.owner_id}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={plant.owner?.avatar_url || undefined} />
                  <AvatarFallback>{plant.owner?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{plant.owner?.username || "Plant Owner"}</p>
                  <div className="flex items-center gap-1 text-xs text-plant-gray">
                    {plant.owner?.location && (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span>{plant.owner.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
              <div className="text-xs text-plant-gray">
                Added {formatDistanceToNow(new Date(plant.created_at), { addSuffix: true })}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              {isOwner ? (
                <>
                  <Button 
                    variant="outline" 
                    className="border-red-200 hover:bg-red-50 w-full"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Plant
                  </Button>
                  <Button 
                    className="bg-plant-dark-green hover:bg-plant-dark-green/90 w-full"
                    onClick={() => navigate(`/edit-plant/${plant.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Plant
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-plant-mint/50 hover:bg-plant-mint/10 w-full"
                    onClick={() => navigate(`/messages?user=${plant.owner_id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Owner
                  </Button>
                  <Button 
                    className={`w-full ${plant.available_for_swap ? 'bg-plant-dark-green hover:bg-plant-dark-green/90' : 'bg-gray-400 hover:bg-gray-400/90'}`}
                    onClick={() => setShowSwapModal(true)}
                    disabled={!plant.available_for_swap || !!existingSwapRequest}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {existingSwapRequest ? 
                      `Request ${existingSwapRequest.status}` : 
                      "Request Swap"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Swap Request Modal */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Swap</DialogTitle>
            <DialogDescription>
              Send a swap request to the owner of this plant. Include information about what plants you can offer in exchange.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Hi! I'm interested in swapping for your plant. Would you like to see what I have available?"
              value={swapMessage}
              onChange={(e) => setSwapMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwapModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-plant-dark-green hover:bg-plant-dark-green/90"
              onClick={handleSwapRequest}
              disabled={isCreating || !swapMessage.trim()}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePlant}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Plant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
